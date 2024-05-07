import React, { useState, useEffect } from 'react';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const VehicleApp = () => {
    const [vehicles, setVehicles] = useState([]);
    const [newVehicle, setNewVehicle] = useState({ licensePlate: '', brand: '', model: '', year: '' });

    // Mengimpor protobuf
    const PROTO_PATH = './vehicle.proto';
    const packageDefinition = protoLoader.loadSync(PROTO_PATH);
    const vehicleProto = grpc.loadPackageDefinition(packageDefinition).vehicle;

    const client = new vehicleProto.VehicleService(
        'localhost:50051',
        grpc.credentials.createInsecure()
    );

    // Fungsi untuk mengambil data kendaraan
    const fetchVehicles = async () => {
        client.ListVehicles({}, (error, response) => {
            if (error) {
                console.error('Error fetching vehicles:', error);
            } else {
                setVehicles(response.vehicles);
            }
        });
    };

    // Fungsi untuk membuat kendaraan baru
    const createVehicle = async () => {
        client.CreateVehicle(newVehicle, (error, response) => {
            if (error) {
                console.error('Error creating vehicle:', error);
            } else {
                fetchVehicles();
                setNewVehicle({ licensePlate: '', brand: '', model: '', year: '' });
            }
        });
    };

    // Fungsi untuk menghapus kendaraan
    const deleteVehicle = async (id) => {
        client.DeleteVehicle({ id }, (error, response) => {
            if (error) {
                console.error('Error deleting vehicle:', error);
            } else {
                fetchVehicles();
            }
        });
    };

    // Mengambil data kendaraan saat komponen di-mount
    useEffect(() => {
        fetchVehicles();
    }, []);

    return (
        <div>
            <h1>Sistem Pencatatan Nomor Plat Kendaraan</h1>
            <div>
                <h2>Data Kendaraan</h2>
                <ul>
                    {vehicles.map((vehicle) => (
                        <li key={vehicle.id}>
                            {vehicle.licensePlate} - {vehicle.brand} - {vehicle.model} ({vehicle.year})
                            <button onClick={() => deleteVehicle(vehicle.id)}>Hapus</button>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h2>Tambah Kendaraan Baru</h2>
                <input
                    type="text"
                    placeholder="Nomor Plat"
                    value={newVehicle.licensePlate}
                    onChange={(e) => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Merek"
                    value={newVehicle.brand}
                    onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Model"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Tahun"
                    value={newVehicle.year}
                    onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
                />
                <button onClick={createVehicle}>Tambah Kendaraan</button>
            </div>
        </div>
    );
};

export default VehicleApp;
