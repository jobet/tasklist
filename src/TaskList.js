import React, { useState, useEffect } from "react";
import { MdDragIndicator, MdEdit, MdDelete, MdLogout } from "react-icons/md";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function TaskList({userSession, setUserSession}) {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState("");
  const [newTask, setNewTask] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [updatedTaskText, setUpdatedTaskText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [userSession]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("tasklist_users")
        .select("*")
        .eq("user_uuid", userSession.id);

      if (error) {
        console.error("Error fetching users:", error.message);
      } else {
        setUser(data[0].user_username);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };



  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasklist_tasks")
        .select("*")
        .eq("task_userid", userSession.id)
        .order("task_order", { ascending: true });

      if (error) {
        console.error("Error fetching tasks:", error.message);
      } else {
        setTasks(data);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const inputChange = (e) => {
    setNewTask(e.target.value);
  };

  const addTask = async (e) => {
    if (e.key === "Enter" && newTask.trim()) {
      try {
        const newTaskObj = {
          task_name: newTask.trim(),
          task_completed: false,
          task_userid: userSession.id,
          task_date: new Date(),
          task_order: tasks.length + 1,
        };

        setNewTask("");
  
        const { data, error } = await supabase
          .from("tasklist_tasks")
          .insert([newTaskObj])
          .select();
  
        if (error) {
          console.error("Error adding task:", error.message);
        } else {
          setTasks([...tasks, data[0]]);
        }
      } catch (err) {
        console.error("Error:", err);
      }
    }
  };

  const toggleTaskCompletion = async (taskId, isCompleted) => {
    try {
      const updatedTasks = tasks.map((task) =>
        task.task_id === taskId ? { ...task, task_completed: !isCompleted } : task
      );
  
      setTasks(updatedTasks);
  
      const { error } = await supabase
        .from("tasklist_tasks")
        .update({ task_completed: !isCompleted })
        .eq("task_id", taskId);
  
      if (error) {
        console.error("Error updating task completion:", error.message);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      setTasks(tasks.filter((task) => task.task_id !== taskId));
      setEditingIndex(null);
  
      const { error } = await supabase
        .from("tasklist_tasks")
        .delete()
        .eq("task_id", taskId);
  
      if (error) {
        console.error("Error deleting task:", error.message);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const updateTaskText = (e) => setUpdatedTaskText(e.target.value);

  const startEditing = (taskId, taskText) => {
    setEditingIndex(taskId);
    setUpdatedTaskText(taskText);
  };

  const saveUpdatedTask = async (e, taskId) => {
    if (e.key === "Enter" && updatedTaskText.trim()) {
      try {
        const updatedTasks = tasks.map((task) =>
          task.task_id === taskId ? { ...task, task_name: updatedTaskText } : task
        );
  
        setTasks(updatedTasks);
        setEditingIndex(null);
        setUpdatedTaskText("");
  
        const { error } = await supabase
          .from("tasklist_tasks")
          .update({ task_name: updatedTaskText })
          .eq("task_id", taskId);
  
        if (error) {
          console.error("Error updating task:", error.message);
        }
      } catch (err) {
        console.error("Error:", err);
      }
    }
    if (e.key === "Escape") {
      setEditingIndex(null);
      setUpdatedTaskText("");
    }
  };

  const reorderTasks = (result) => {
    if (!result.destination) return;
  
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
  
    // Update the task order in the client-side state
    const updatedTasks = items.map((task, index) => ({
      ...task,
      task_order: index + 1,
    }));
  
    setTasks(updatedTasks);
  
    // Update the task order in the database
    updateTaskOrderInDatabase(updatedTasks);
  };
  
  const updateTaskOrderInDatabase = async (updatedTasks) => {
    try {
      const { error } = await supabase
        .from("tasklist_tasks")
        .upsert(updatedTasks, { onConflict: "task_id" });
  
      if (error) {
        console.error("Error reordering tasks:", error.message);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && editingIndex !== null) {
        setEditingIndex(null);
        setUpdatedTaskText("");
      }
    };
  
    document.addEventListener("keydown", handleKeyDown);
  
    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editingIndex, setEditingIndex]);

  const logoutUser = () => {
    setUserSession(null);
    Cookies.remove("userSession");
    navigate("/");
  };

  return (
      <div className="container">
        <div className="taskWindow">
          <h1>Tasklist</h1>
          <div className="userArea">
            <div>
              <h2>{user}'s Tasks</h2>
            </div>
            <div>
              <button onClick={logoutUser} className="logoutBtn">
                <MdLogout className="logoutSymbol"/>
                <span>Logout</span>
              </button>
            </div>
          </div>
          <DragDropContext onDragEnd={reorderTasks}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <ul {...provided.droppableProps} ref={provided.innerRef}>
                {tasks.map((task, index) => (
                  <Draggable key={task.task_id} draggableId={task.task_id.toString()} index={index}>
                    {(provided) => (
                      <li
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                      >
                        <div className={`${task.task_completed ? "taskCompleted" : "taskContainer"}`}>
                          <div className="taskListItem">
                            <MdDragIndicator className="dragIndicator" />
                            {editingIndex === task.task_id ? (
                              <>
                                <div />
                                <input
                                  className="editTaskItem"
                                  type="text"
                                  value={updatedTaskText}
                                  onChange={updateTaskText}
                                  onKeyDown={(e) => saveUpdatedTask(e, task.task_id)}
                                />
                                <div />
                              </>
                            ) : (
                              <>
                                <input
                                  type="checkbox"
                                  checked={task.task_completed}
                                  onChange={() => toggleTaskCompletion(task.task_id, task.task_completed)}
                                  className="taskCheckbox"
                                />
                                <div className="taskItem">
                                  <span>{task.task_name}</span>
                                </div>
                                <div className="taskDate">
                                  <span>
                                    {new Date(task.task_date).toLocaleString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>
                                <button className="editTaskBtn" title="Edit Task" onClick={() => startEditing(task.task_id, task.task_name)}>
                                  <MdEdit />
                                </button>
                                <button className="delTaskBtn" title="Delete Task" onClick={() => deleteTask(task.task_id)}>
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
          </DragDropContext>
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
  );
}

export default TaskList;