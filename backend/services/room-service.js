const RoomModel = require("../models/room-model");
const mongoose = require("mongoose");

class RoomService{
    async create(payload){
        const { topic, roomType, ownerId } = payload;
        // room creation logic
        const room = await RoomModel.create({
            topic, 
            roomType, 
            ownerId, 
            speakers: [ownerId],
        });
        return room;
    }

    async getAllRooms(types){
        const rooms = await RoomModel.find({ roomType: { $in: types } }) // Find rooms with types
        .populate("speakers") // Populate speakers
        .populate("ownerId") // Populate ownerId
        .exec();
        return rooms;
    }

    // async getRoom(roomId) {
    //     const room = await RoomModel.findOne({ _id: roomId });
    //     return room;
    // }


async getRoom(roomId) {
    // Sanitize and Validate roomId
    const cleanRoomId = roomId.replace(/[^a-fA-F0-9]/g, "");

    if (!mongoose.Types.ObjectId.isValid(cleanRoomId)) {
        throw new Error("Invalid Room ID");
    }
    const room = await RoomModel.findOne({ _id: cleanRoomId }).populate("speakers").populate("ownerId");
    return room;
}

}

module.exports = new RoomService();