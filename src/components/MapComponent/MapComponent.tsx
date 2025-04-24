import React, { useState, useEffect } from 'react';
import {
  GoogleMap,
  Marker,
  InfoWindow,
  LoadScript,
} from '@react-google-maps/api';
import './MapComponent.css';

interface MapProps {
  tasks: { lat?: number; lng?: number; id: string; title: string }[];
}

const containerStyle = {
  width: '100%',
  height: '400px',
};

const MapComponent: React.FC<MapProps> = ({ tasks }) => {
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number>(0);
  const [showInfoWindow, setShowInfoWindow] = useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<
    { lat?: number; lng?: number; id: string; title: string } | undefined
  >(undefined);

  useEffect(() => {
    if (tasks.length > 0) {
      setCurrentTask(tasks[0]);
    }
  }, [tasks]);

  const handleMarkerClick = (task: {
    lat?: number;
    lng?: number;
    id: string;
    title: string;
  }) => {
    setShowInfoWindow(true);
    setCurrentTask(task);
  };

  const handlePrevTask = () => {
    if (selectedTaskIndex > 0) {
      const prevTask = tasks[selectedTaskIndex - 1];
      setSelectedTaskIndex(selectedTaskIndex - 1);
      setCurrentTask(prevTask);
    }
  };

  const handleNextTask = () => {
    if (selectedTaskIndex < tasks.length - 1) {
      const nextTask = tasks[selectedTaskIndex + 1];
      setSelectedTaskIndex(selectedTaskIndex + 1);
      setCurrentTask(nextTask);
    }
  };

  const center = {
    lat: currentTask?.lat || 37.7749,
    lng: currentTask?.lng || -122.4194,
  };

  return (
    <>
      <div className="map-arrow-buttons">
        <button
          className="switchButtons"
          onClick={handlePrevTask}
          disabled={selectedTaskIndex === 0}
        >
          &lt;
        </button>
        <button
          className="switchButtons"
          onClick={handleNextTask}
          disabled={selectedTaskIndex === tasks.length - 1}
        >
          &gt;
        </button>
      </div>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
        {tasks.map(task =>
          task.lat && task.lng ? (
            <Marker
              key={task.id}
              position={{ lat: task.lat, lng: task.lng }}
              title={task.title}
              onClick={() => handleMarkerClick(task)}
            />
          ) : null
        )}
        {showInfoWindow && currentTask?.lat && currentTask?.lng && (
          <InfoWindow
            position={{ lat: currentTask.lat + 0.01, lng: currentTask.lng }}
            onCloseClick={() => setShowInfoWindow(false)}
          >
            <div>
              <strong>{currentTask.title}</strong>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </>
  );
};

export default React.memo(MapComponent);
