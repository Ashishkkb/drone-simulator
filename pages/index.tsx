// pages/simulate.tsx

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Map from '../components/Map';

// Define your Mapbox access token here
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiYXNoaXNoMTMxMiIsImEiOiJjbG11cDZyeTkwazVhMmt2ejcyOXJibTQ3In0.tiuLKPdb6VNgT5L17NbtkQ';

const Simulate = () => {
    const [latitude, setLatitude] = useState<string>('');
    const [longitude, setLongitude] = useState<string>('');
    const [path, setPath] = useState<[number, number][]>([]); // Array of latitude and longitude pairs
    const [isSimulationPaused, setIsSimulationPaused] = useState<boolean>(true);

    const handleLatitudeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLatitude(e.target.value);
    };

    const handleLongitudeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLongitude(e.target.value);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        // Add the data to your simulation
        if (latitude && longitude) {
            const newLatitude = parseFloat(latitude);
            const newLongitude = parseFloat(longitude);
            setPath((prevPath) => [...prevPath, [newLongitude, newLatitude]]);
            setLatitude('');
            setLongitude('');
        }
    };

    const handlePauseResume = () => {
        setIsSimulationPaused((prev) => !prev);
    };

    const handleReset = () => {
        setPath([]); // Clear the path
        setIsSimulationPaused(true); // Pause simulation
    };

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; // Get the first selected file
        if (file) {
          // Read the file as text
          const reader = new FileReader();
          reader.onload = (event) => {
            const fileContent = event.target?.result as string;
      
            // Assuming the CSV has latitude and longitude columns separated by a comma
            const lines = fileContent.split('\n');
            const csvData = lines.map((line) => {
              const [longitude, latitude] = line.split(',').map(Number);
              return [longitude, latitude];
            });
      
            // Filter out invalid data (lines without latitude or longitude)
            const validCsvData: [number, number][] = csvData
              .filter(([longitude, latitude]) => !isNaN(longitude) && !isNaN(latitude))
              .map(([longitude, latitude]) => [longitude, latitude]);
      
            // Update the map's path with the valid CSV data
            setPath(validCsvData);
          };
          reader.readAsText(file); // Read the file as text
        }
      };      
        
    return (
        <div className='max-h-screen bg-gradient-to-r from-blue-400 to-blue-600 items-center justify-center p-8 overflow-y-scroll'>
            <div className="flex flex-row p-10 shadow-lg h-full">
                <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-2xl mx-4 h-[500px]">
                    <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Drone Simulation</h1>
                    <form onSubmit={handleSubmit} className="mb-8 flex flex-col items-center">
                        <div className="w-full p-4">
                            <input
                                type="text"
                                id="latitude"
                                name="latitude"
                                value={latitude}
                                onChange={handleLatitudeChange}
                                placeholder="Enter Latitude"
                                className="border border-gray-300 px-4 py-2 rounded-lg w-full"
                            />
                        </div>
                        <div className="w-full p-4">
                            <input
                                type="text"
                                id="longitude"
                                name="longitude"
                                value={longitude}
                                onChange={handleLongitudeChange}
                                placeholder="Enter Longitude"
                                className="border border-gray-300 px-4 py-2 rounded-lg w-full"
                            />
                        </div>
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={handlePauseResume}
                                className={isSimulationPaused ? `flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md shadow-md` : `flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md shadow-md`}
                            >
                                {isSimulationPaused ? 'Find' : 'Pause'}
                            </button>
                            <button
                                type="submit"
                                className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md shadow-md`}
                            >
                                Add
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className={`flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md shadow-md`}
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                    <div>
                        <label htmlFor="csvFile" className="block font-semibold text-gray-700 mb-2">
                            Upload CSV File
                        </label>
                        <input
                            type="file"
                            id="csvFile"  // Should match the htmlFor attribute in the label
                            name="csvFile"  // Should match the name attribute in the input
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="border border-gray-300 rounded px-4 py-2 w-full"
                            style={{display:'none'}}
                        />
                    </div>
                </div>
                <div className="bg-white bg-opacity-90 shadow-md rounded-lg w-2/3 mx-4 p-4 max-h-screen overflow-y-scroll">
                    <h2 className="text-2xl mb-4 text-center text-gray-800 font-bold">Added Data</h2>
                    <ul className="px-4">
                        {path.map(([longitude, latitude], index) => (
                            <li key={index} className="mb-2">
                                Latitude: {latitude}, Longitude: {longitude}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="w-full h-[600px] mx-4">
                    <Map path={path} accessToken={MAPBOX_ACCESS_TOKEN} />
                </div>
            </div>

        </div>


    );
};

export default Simulate;


