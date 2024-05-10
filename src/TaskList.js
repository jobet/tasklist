import React, { useState } from 'react';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  const inputChange = (e) => {
    setNewTask(e.target.value);
  };

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { text: newTask.trim(), completed: false }]);
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
  };

  return (
    <div className="container">
			<div>
				<h1>To-do List</h1>
				<ul>
					{tasks.map((task, index) => (
						<li key={index}>
							<div className="taskContainer">
								<input
									type="checkbox"
									checked={task.completed}
									onChange={() => toggleTaskCompletion(index)}
									className="taskCheckbox"
								/>
								<div className="taskItem">
									<span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
										{task.text}
									</span>
								</div>
								<button className="delTaskBtn" onClick={() => deleteTask(index)}>X</button>
							</div>
						</li>
					))}
      	</ul>
				<div className="addTaskSection">
					<input 
						type="text" 
						onChange={inputChange} 
						value={newTask} 
						placeholder="Enter a new task"
					/>
					<button onClick={addTask} className="addTaskBtn">+</button>
				</div>
			</div>
    </div>
  );
};

export default TaskList;