import Message from "../models/Message.model.js";
import Channel from "../models/Channel.model.js";

// @desc    Get chat history
// @route   GET /api/chat/history/:channel
// @access  Private
export const getChatHistory = async (req, res) => {
  try {
    const { channel } = req.params;
    const messages = await Message.find({ channel })
      .sort({ createdAt: 1 })
      .limit(50);
    
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all channels
// @route   GET /api/chat/channels
// @access  Private
export const getChannels = async (req, res) => {
  try {
    let channels = await Channel.find().sort({ createdAt: 1 });
    
    // Seed default channels if empty
    if (channels.length === 0) {
      const defaultChannels = [
        { id: 'general', name: 'General', icon: 'Hash', desc: 'Company Wide Announcements' },
        { id: 'hr-support', name: 'HR Support', icon: 'Hash', desc: 'Human Resources Help & Support' },
        { id: 'engineering', name: 'Engineering', icon: 'Hash', desc: 'Technical Discussions & Sync' },
      ];
      await Channel.insertMany(defaultChannels);
      channels = await Channel.find().sort({ createdAt: 1 });
    }
    
    res.json({ success: true, channels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new channel
// @route   POST /api/chat/channels
// @access  Admin, Manager
export const createChannel = async (req, res) => {
  try {
    const { name, desc } = req.body;
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    const existing = await Channel.findOne({ id });
    if (existing) {
      return res.status(400).json({ success: false, message: "Channel already exists" });
    }

    const channel = await Channel.create({ id, name, desc });
    res.status(201).json({ success: true, channel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete channel
// @route   DELETE /api/chat/channels/:id
// @access  Admin, Manager
export const deleteChannel = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting general
    if (id === 'general') {
      return res.status(400).json({ success: false, message: "Cannot delete the general channel" });
    }

    await Channel.findOneAndDelete({ id });
    // Optional: Delete associated messages
    await Message.deleteMany({ channel: id });

    res.json({ success: true, message: "Channel deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
