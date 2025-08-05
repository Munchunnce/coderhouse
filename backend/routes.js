const router = require('express').Router();
const authController = require('./controllers/auth-controller');
const activateController = require('./controllers/activate-controller');
const authMiddleware = require('./middlewares/auth-middleware');
const roomsController = require('./controllers/rooms-controller');
const mongoose = require("mongoose");
const roomService = require('./services/room-service');


router.post('/api/send-otp', authController.sendOtp);
router.post('/api/verify-otp', authController.verifyOtp);
router.post('/api/activate', authMiddleware, activateController.activate);
router.get('/api/refresh', authController.refresh);
router.post('/api/logout', authMiddleware, authController.logout);
router.post('/api/rooms', authMiddleware, roomsController.create);
router.get('/api/rooms', authMiddleware, roomsController.index);
router.get('/api/rooms/:roomId', async (req, res) => {
    const { roomId } = req.params;
    
    // Remove extra characters and validate ObjectId
    const sanitizedRoomId = roomId.replace(/[^a-fA-F0-9]/g, "");

    if (!mongoose.Types.ObjectId.isValid(sanitizedRoomId)) {
        return res.status(400).json({ error: "Invalid Room ID" });
    }

    try {
        const room = await roomService.getRoom(sanitizedRoomId);
        res.json(room);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



module.exports = router;