const RoomModel = require("../models/room-model");

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
        return  rooms;
    }
}

module.exports = new RoomService();