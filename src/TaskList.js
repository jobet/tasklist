import React, { useState, useEffect } from 'react';
import { MdDragIndicator, MdEdit, MdDelete } from "react-icons/md";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [updatedTaskText, setUpdatedTaskText] = useState('');

  const inputChange = (e) => {
    setNewTask(e.target.value);
  };

  const addTask = (e) => {
    if (e.key === 'Enter' && newTask.trim()) {
      const newTaskObj = {
        id: Math.random().toString(36).substr(2, 9),
        text: newTask.trim(),
        completed: false,
        date: new Date()
      };
      setTasks([...tasks, newTaskObj]);
      setNewTask('');
    }
  };

  const toggleTaskCompletion = (index) => {
    setTasks(
      tasks.map((task, i) =>
        i === index ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
    setEditingIndex(null);
  };

  const updateTaskText = (e) => setUpdatedTaskText(e.target.value);

  const startEditing = (index) => {
    setEditingIndex(index);
    setUpdatedTaskText(tasks[index].text);
  };

  const saveUpdatedTask = (e) => {
    if (e.key === 'Enter' && updatedTaskText.trim()) {
      setTasks(
        tasks.map((task, i) =>
          i === editingIndex ? { ...task, text: updatedTaskText } : task
        )
      );
      setEditingIndex(null);
      setUpdatedTaskText('');
    }
    if (e.key === 'Escape') {
      setEditingIndex(null);
      setUpdatedTaskText('');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && editingIndex !== null) {
        setEditingIndex(null);
        setUpdatedTaskText('');
      }
    };
  
    document.addEventListener('keydown', handleKeyDown);
  
    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [editingIndex, setEditingIndex]);

  const reorderTasks = (result) => {
    if (!result.destination) return;
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTasks(items);
  };

  return (
    <DragDropContext onDragEnd={reorderTasks}>
      <div className="container">
        <div className="taskWindow">
          <h1>TaskList</h1>
          <Droppable droppableId="tasks">
            {(provided) => (
              <ul {...provided.droppableProps} ref={provided.innerRef}>
                {tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                    {(provided) => (
                      <li
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                      >
                        <div className={`${task.completed ? 'taskCompleted' : 'taskContainer'}`}>
                          <div className="taskListItem">
                          <MdDragIndicator className="dragIndicator" />
                          {editingIndex === index ? (
                            <>
                              <div/>
                              <input
                                className="editTaskItem"
                                type="text"
                                value={updatedTaskText}
                                onChange={updateTaskText}
                                onKeyDown={saveUpdatedTask}
                              />
                              <div/>
                            </>
                          ) : (
                            <>
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => toggleTaskCompletion(index)}
                                className="taskCheckbox"
                              />
                              <div className="taskItem">
                                <span>
                                  {task.text}
                                </span>
                              </div>
                              <div className="taskDate">
                                <span>
                                  {task.date.toLocaleString('en-US', {
                                      year: 'numeric',
                                      month: 'long', 
                                      day: 'numeric',
                                  })}
                                </span>
                              </div>
                              <button className="editTaskBtn" onClick={() => startEditing(index)}>
                                <MdEdit />
                              </button>
                              <button className="delTaskBtn" onClick={() => deleteTask(index)}>
                                <MdDelete />
                              </button>
                            </>
                          )}
                          </div>
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </div>
        <div className="addTaskSection">
          <input
            className="addTaskInput"
            type="text"
            onChange={inputChange}
            value={newTask}
            placeholder="Type a new task..."
            onKeyDown={addTask}
          />
        </div>
      </div>
    </DragDropContext>
  );
}

export default TaskList;