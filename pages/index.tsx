import React, { useState, ChangeEvent, FormEvent, useRef, useEffect } from 'react';
import Map from '../components/Map';

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiYXNoaXNoMTMxMiIsImEiOiJjbG11cDZyeTkwazVhMmt2ejcyOXJibTQ3In0.tiuLKPdb6VNgT5L17NbtkQ';

const Simulate = () => {
    const [latitude, setLatitude] = useState<string>('');
    const [longitude, setLongitude] = useState<string>('');
    const [path, setPath] = useState<[number, number][]>([]);
    const [isSimulationPaused, setIsSimulationPaused] = useState<boolean>(true);
    const [isFormCollapsed, setIsFormCollapsed] = useState<boolean>(false);

    const [currentPathIndex, setCurrentPathIndex] = useState<number>(0);
    const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(false);

    const [dronePosition, setDronePosition] = useState<[number, number] | null>(null);
    const [isDroneMoving, setIsDroneMoving] = useState<boolean>(false);

    const [tempCoordinates, setTempCoordinates] = useState<[number, number][]>([]);

    const handleLatitudeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLatitude(e.target.value);
    };

    const handleLongitudeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLongitude(e.target.value);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (latitude && longitude) {
            const newLatitude = parseFloat(latitude);
            const newLongitude = parseFloat(longitude);
            setTempCoordinates((prevCoordinates) => [...prevCoordinates, [newLongitude, newLatitude]]);
            setLatitude('');
            setLongitude('');
        }
    };

    const handlePauseResume = () => {
        setIsSimulationPaused((prev) => !prev);

        if (!isDroneMoving && !isSimulationPaused && path.length > 0) {
            setIsDroneMoving(true);
            simulateDrone();
        }
    };

    const handleReset = () => {
        setPath([]);
        setIsSimulationPaused(true);
        setCurrentPathIndex(0);
        setIsSimulationRunning(false);
        setDronePosition(null);
    };

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const openFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleToggleForm = () => {
        setIsFormCollapsed((prev) => !prev);
    };

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
        const files = ('dataTransfer' in e ? e.dataTransfer.files : e.target.files) as FileList | null;
        if (files && files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const fileContent = event.target?.result as string;

                const lines = fileContent.split('\n');
                const csvData = lines.map((line) => {
                    const [longitude, latitude] = line.split(',').map(Number);
                    return [longitude, latitude];
                });

                const validCsvData: [number, number][] = csvData
                    .filter(([longitude, latitude]) => !isNaN(longitude) && !isNaN(latitude))
                    .map(([longitude, latitude]) => [longitude, latitude]);

                setPath((prevPath) => [...prevPath, ...validCsvData]);
            };
            reader.readAsText(file);
        }
    };

    const simulateDrone = () => {
        if (currentPathIndex < path.length - 1) {
            const interval = setInterval(() => {
                if (isSimulationPaused) {
                    clearInterval(interval);
                } else {
                    setCurrentPathIndex((prev) => prev + 1);
                    setDronePosition(path[currentPathIndex]);
                }
            }, 1000);
        } else {
            setIsSimulationRunning(false);
        }
    };

    useEffect(() => {
        if (!isSimulationRunning && !isSimulationPaused && path.length > 0) {
            setIsSimulationRunning(true);
            simulateDrone();
        }
    }, [isSimulationPaused, isSimulationRunning, path, currentPathIndex]);

    useEffect(() => {
        if (tempCoordinates.length > 0) {
            setPath((prevPath) => [...prevPath, ...tempCoordinates]);
            setTempCoordinates([]);
        }
    }, [tempCoordinates]);

    return (
        <div className="flex h-screen">
            <div className={`p-4 bg-white shadow-md ${isFormCollapsed ? 'hidden' : ''} absolute mt-20 ml-20 rounded-lg`}>
                <div className="flex justify-between items-center mb-4 w-[400px]">
                    <h1 className="text-4xl font-bold text-gray-800 ">Drone Simulation</h1>
                </div>
                <form onSubmit={handleSubmit} className={isFormCollapsed ? 'hidden' : 'flex flex-col space-y-4'}>
                    <div className="w-full">
                        <label htmlFor="latitude" className="block text-lg  font-semibold mb-2">Latitude</label>
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
                    <div className="w-full">
                        <label htmlFor="longitude" className="block text-lg  font-semibold mb-2">Longitude</label>
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
                            className={isSimulationPaused ? `bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md shadow-md` : `bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md shadow-md`}
                        >
                            {isSimulationPaused ? 'Find' : 'Pause'}
                        </button>
                        <button
                            type="submit"
                            className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md shadow-md`}
                        >
                            Add
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className={`bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md shadow-md`}
                        >
                            Reset
                        </button>
                    </div>
                    <div className="mt-4">
                        <label
                            htmlFor="csvFile"
                            className="block text-lg font-semibold mb-2"
                        >
                            Upload CSV File
                        </label>
                        <div
                            className="border-dotted border-2 border-green-500 rounded px-4 py-6 mx-auto cursor-pointer bg-transparent"
                            onClick={openFileInput}
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleFileUpload(e);
                            }}
                        >
                            <div className='flex flex-row'>
                                <svg width="17" height="21" viewBox="0 0 17 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-4">
                                    <path d="M16.4161 4.17365V20.4012H1V1H13.3212" stroke="#098F48" stroke-width="0.7" stroke-miterlimit="10" />
                                </svg>
                                <div className="text-sm text-green-600">
                                    Drop files here to upload or <span className="font-bold underline cursor-pointer" onClick={openFileInput}>Choose File</span>
                                </div>
                            </div>
                        </div>
                        <input
                            type="file"
                            id="csvFile"
                            name="csvFile"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="hidden"
                            ref={fileInputRef}
                        />
                    </div>
                </form>
            </div>
            <div className={`w-screen h-screen`}>
                <Map path={path} accessToken={MAPBOX_ACCESS_TOKEN} dronePosition={dronePosition} isDroneMoving={isDroneMoving}/>
            </div>
            <div className="absolute top-4 right-4">
                <button
                    onClick={handleToggleForm}
                    className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-md`}
                >
                    {isFormCollapsed ? 'Show Form' : 'Hide Form'}
                </button>
            </div>
            {path.length > 0 && (
                <div className="absolute bottom-4 right-4 max-h-[200px] overflow-y-auto">
                    <div className="bg-white shadow-md p-4 rounded-lg">
                        <h2 className="text-xl font-semibold mb-2">Added Data</h2>
                        <ul>
                            {path.map(([longitude, latitude], index) => (
                                <li key={index}>
                                    Latitude: {latitude}, Longitude: {longitude}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Simulate;
