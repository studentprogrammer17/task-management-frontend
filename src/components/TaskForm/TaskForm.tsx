import React, { useState, useEffect } from 'react';
import {
  CreateTaskDto,
  Task,
  TaskStatus,
  UpdateTaskDto,
} from '../../models/Task';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import './TaskForm.css';
import { CategoryService } from '../../services/category.service';

interface TaskFormProps {
  onSubmit: (task: CreateTaskDto) => void;
  onCancel: () => void;
  initialTask?: Task;
  isSubtask?: boolean;
  parentTaskId?: string;
}

const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  onCancel,
  initialTask,
  isSubtask = false,
  parentTaskId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [includeSubtasks, setIncludeSubtasks] = useState(false);
  const [subtasks, setSubtasks] = useState<CreateTaskDto[]>([]);
  const [latitude, setLatitude] = useState<number | null | undefined>(
    undefined
  );
  const [longitude, setLongitude] = useState<number | null | undefined>(
    undefined
  );
  const [endTime, setEndTime] = useState<string>('');

  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [categoryId, setCategoryId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await CategoryService.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setStatus(initialTask.status);
      setCategoryId(initialTask.categoryId || null);
      if (initialTask.endTime) {
        const date = new Date(initialTask.endTime);
        date.setHours(date.getHours() + 3);
        const formattedEndTime = date.toISOString().slice(0, 16);
        setEndTime(formattedEndTime);
      }
      if (initialTask.subtasks && initialTask.subtasks.length > 0) {
        setIncludeSubtasks(true);
        setSubtasks(
          initialTask.subtasks.map(subtask => ({
            title: subtask.title,
            description: subtask.description,
            status: subtask.status,
            subtasks: subtask.subtasks?.map(s => ({
              title: s.title,
              description: s.description,
              status: s.status,
            })),
          }))
        );
      }

      if (initialTask.lat !== undefined && initialTask.lng !== undefined) {
        setLatitude(initialTask.lat);
        setLongitude(initialTask.lng);
      }
    }
  }, [initialTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const taskData: CreateTaskDto = {
      title,
      description: description || undefined,
      status,
      categoryId: categoryId || undefined,
      lat: latitude || undefined,
      lng: longitude || undefined,
      endTime: endTime
        ? (() => {
            const date = new Date(endTime);
            date.setHours(date.getHours() + 3);
            return date.toISOString();
          })()
        : undefined,
    };

    if (includeSubtasks && subtasks.length > 0) {
      taskData.subtasks = subtasks;
    }

    if (parentTaskId) {
      (taskData as CreateTaskDto).parentId = parentTaskId;
    }

    onSubmit(taskData);
  };

  const addSubtask = () => {
    setSubtasks([...subtasks, { title: '', status: 'todo' }]);
  };

  const updateSubtask = (
    index: number,
    field: keyof CreateTaskDto,
    value: string
  ) => {
    const updatedSubtasks = [...subtasks];

    if (field === 'status') {
      updatedSubtasks[index].status = value as TaskStatus;
    } else if (field === 'title') {
      updatedSubtasks[index].title = value;
    } else if (field === 'description') {
      updatedSubtasks[index].description = value || undefined;
    }

    setSubtasks(updatedSubtasks);
  };

  const removeSubtask = (index: number) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks.splice(index, 1);
    setSubtasks(updatedSubtasks);
  };

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();
    if (lat && lng) {
      setLatitude(lat);
      setLongitude(lng);
    }
  };

  return (
    <div className="task-form-container">
      <h3>
        {initialTask
          ? 'Edit Task'
          : isSubtask
            ? 'Add Subtask'
            : 'Create New Task'}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            Title*
          </label>
          <input
            type="text"
            className="form-control"
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="endTime" className="form-label">
            End Time
          </label>
          <input
            type="datetime-local"
            className="form-control"
            id="endTime"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
          <div className="form-text">
            Select when this task should be completed
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            className="form-control"
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="status" className="form-label">
            Status*
          </label>
          <select
            className="form-select"
            id="status"
            value={status}
            onChange={e => setStatus(e.target.value as TaskStatus)}
            required
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="category" className="form-label">
            Category
          </label>
          <select
            id="category"
            className="form-select"
            value={categoryId ?? ''}
            onChange={e => setCategoryId(e.target.value || null)}
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {!isSubtask && (
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="includeSubtasks"
              checked={includeSubtasks}
              onChange={e => setIncludeSubtasks(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="includeSubtasks">
              Include Subtasks
            </label>
          </div>
        )}

        {includeSubtasks && (
          <div className="subtasks-section mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5>Subtasks</h5>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={addSubtask}
              >
                Add Subtask
              </button>
            </div>

            {subtasks.map((subtask, index) => (
              <div key={index} className="subtask-item mb-3 p-3 border rounded">
                <div className="mb-2">
                  <label className="form-label">Subtask Title*</label>
                  <input
                    type="text"
                    className="form-control"
                    value={subtask.title}
                    onChange={e =>
                      updateSubtask(index, 'title', e.target.value)
                    }
                    required
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    value={subtask.description || ''}
                    onChange={e =>
                      updateSubtask(index, 'description', e.target.value)
                    }
                    rows={2}
                  />
                </div>

                <div className="d-flex justify-content-between align-items-center">
                  <div style={{ width: '60%' }}>
                    <label className="form-label">Status*</label>
                    <select
                      className="form-select"
                      value={subtask.status}
                      onChange={e =>
                        updateSubtask(index, 'status', e.target.value)
                      }
                      required
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    className="btn btn-sm btn-danger mt-3"
                    onClick={() => removeSubtask(index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mb-3">
          <label className="form-label">Location</label>
          <GoogleMap
            id="map"
            mapContainerStyle={{
              height: '400px',
              width: '100%',
            }}
            center={{
              lat: latitude ?? 37.7749,
              lng: longitude ?? -122.4194,
            }}
            zoom={10}
            onClick={handleMapClick}
          >
            {latitude && longitude && (
              <Marker position={{ lat: latitude, lng: longitude }} />
            )}
          </GoogleMap>
        </div>

        <div className="d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-secondary me-2"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {initialTask ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
