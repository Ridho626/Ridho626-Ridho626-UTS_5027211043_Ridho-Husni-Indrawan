const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const proto = grpc.loadPackageDefinition(protoLoader.loadSync('vehicle.proto')).vehicle;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/vehicle', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schema MongoDB untuk kendaraan
const vehicleSchema = new mongoose.Schema({
  licensePlate: String,
  brand: String,
  model: String,
  year: Number,
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

// Handler gRPC
const vehicleService = {
  async GetVehicle(call, callback) {
    try {
      const vehicle = await Vehicle.findById(call.request.id);
      callback(null, { vehicle });
    } catch (error) {
      callback(error);
    }
  },

  async CreateVehicle(call, callback) {
    try {
      const vehicle = new Vehicle(call.request);
      await vehicle.save();
      callback(null, { vehicle });
    } catch (error) {
      callback(error);
    }
  },

  async UpdateVehicle(call, callback) {
    try {
      const updatedVehicle = await Vehicle.findByIdAndUpdate(
        call.request.id,
        call.request,
        { new: true }
      );
      callback(null, { vehicle: updatedVehicle });
    } catch (error) {
      callback(error);
    }
  },

  async DeleteVehicle(call, callback) {
    try {
      const deletedVehicle = await Vehicle.findByIdAndDelete(call.request.id);
      callback(null, { vehicle: deletedVehicle });
    } catch (error) {
      callback(error);
    }
  },

  async ListVehicles(call, callback) {
    try {
      const vehicles = await Vehicle.find({});
      callback(null, { vehicles });
    } catch (error) {
      callback(error);
    }
  }
};

const server = new grpc.Server();
server.addService(proto.VehicleService.service, vehicleService);
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (error) => {
  if (error) {
    console.error('Error starting gRPC server:', error);
    return;
  }
  console.log('gRPC server running at http://0.0.0.0:50051');
  server.start();
});
