import express from "express";
import Session from "../models/Session.js";
import aiService from "../services/aiService.js";
import jwt from "jsonwebtoken";
import multer from "multer";

const router = express.Router();

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all sessions for a user
router.get('/', verifyToken, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.userId })
      .select('name lastAccessed created messages currentComponent')
      .sort({ lastAccessed: -1 });

    const sessionList = sessions.map(session => ({
      id: session._id,
      name: session.name,
      lastAccessed: session.lastAccessed,
      created: session.created,
      messageCount: session.messages.length,
      hasComponent: !!session.currentComponent?.jsx
    }));

    res.json(sessionList);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Failed to fetch sessions' });
  }
});

// Create new session
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    
    const session = new Session({
      userId: req.userId,
      name: name || 'Untitled Session',
      messages: [],
      currentComponent: {
        jsx: '',
        css: ''
      }
    });

    await session.save();
    
    res.status(201).json({
      id: session._id,
      name: session.name,
      messages: session.messages,
      currentComponent: session.currentComponent,
      created: session.created
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ message: 'Failed to create session' });
  }
});

// Get specific session
router.get('/:sessionId', verifyToken, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.sessionId,
      userId: req.userId
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({
      id: session._id,
      name: session.name,
      messages: session.messages,
      currentComponent: session.currentComponent,
      componentHistory: session.componentHistory,
      created: session.created,
      lastAccessed: session.lastAccessed
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ message: 'Failed to fetch session' });
  }
});

// Update session name
router.patch('/:sessionId', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    
    const session = await Session.findOneAndUpdate(
      { _id: req.params.sessionId, userId: req.userId },
      { name },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({ id: session._id, name: session.name });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ message: 'Failed to update session' });
  }
});

// Delete session
router.delete('/:sessionId', verifyToken, async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({
      _id: req.params.sessionId,
      userId: req.userId
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ message: 'Failed to delete session' });
  }
});

// Send message and generate component
router.post('/:sessionId/messages', verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { content, isRefinement } = req.body;
    const sessionId = req.params.sessionId;

    const session = await Session.findOne({
      _id: sessionId,
      userId: req.userId
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Add user message
    const userMessage = {
      role: 'user',
      content,
      timestamp: new Date()
    };

    // Handle image if provided
    if (req.file) {
      const base64Image = req.file.buffer.toString('base64');
      userMessage.image = `data:${req.file.mimetype};base64,${base64Image}`;
    }

    session.messages.push(userMessage);

    // Generate component using AI
    const previousCode = isRefinement && session.currentComponent?.jsx 
      ? session.currentComponent 
      : null;

    const generatedComponent = await aiService.generateComponent(
      content,
      previousCode,
      session.messages.slice(-10) // Pass recent message history
    );

    // Add assistant message
    const assistantMessage = {
      role: 'assistant',
      content: isRefinement 
        ? `I've updated your component based on your request: "${content}"`
        : `I've generated a React component for: "${content}"`,
      timestamp: new Date()
    };

    session.messages.push(assistantMessage);

    // Save previous component to history if it exists
    if (session.currentComponent?.jsx) {
      session.componentHistory.push({
        jsx: session.currentComponent.jsx,
        css: session.currentComponent.css,
        timestamp: new Date()
      });
    }

    // Update current component
    session.currentComponent = {
      jsx: generatedComponent.jsx,
      css: generatedComponent.css,
      timestamp: new Date()
    };

    await session.save();

    res.json({
      message: assistantMessage,
      component: session.currentComponent,
      sessionId: session._id
    });

  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ message: 'Failed to process message' });
  }
});

// Get component history for a session
router.get('/:sessionId/history', verifyToken, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.sessionId,
      userId: req.userId
    }).select('componentHistory currentComponent');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const history = [...session.componentHistory];
    if (session.currentComponent?.jsx) {
      history.push(session.currentComponent);
    }

    res.json(history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
  } catch (error) {
    console.error('Error fetching component history:', error);
    res.status(500).json({ message: 'Failed to fetch component history' });
  }
});

// Revert to a previous component version
router.post('/:sessionId/revert/:componentIndex', verifyToken, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.sessionId,
      userId: req.userId
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const componentIndex = parseInt(req.params.componentIndex);
    if (componentIndex < 0 || componentIndex >= session.componentHistory.length) {
      return res.status(400).json({ message: 'Invalid component index' });
    }

    // Save current as history
    if (session.currentComponent?.jsx) {
      session.componentHistory.push({
        jsx: session.currentComponent.jsx,
        css: session.currentComponent.css,
        timestamp: new Date()
      });
    }

    // Revert to selected component
    const revertComponent = session.componentHistory[componentIndex];
    session.currentComponent = {
      jsx: revertComponent.jsx,
      css: revertComponent.css,
      timestamp: new Date()
    };

    // Add system message about reversion
    session.messages.push({
      role: 'assistant',
      content: `Reverted to a previous component version.`,
      timestamp: new Date()
    });

    await session.save();

    res.json({
      component: session.currentComponent,
      message: 'Successfully reverted to previous version'
    });

  } catch (error) {
    console.error('Error reverting component:', error);
    res.status(500).json({ message: 'Failed to revert component' });
  }
});

export default router;