import { useState, useEffect } from "react";


//create your first component
export const TodoList = () => {

	const username = "NandoR89"
	const host = 'https://playground.4geeks.com/todo'
	const getUrl = `${host}/users/${username}`
	const postUrl = `${host}/todos/${username}`
	const postUrlUserName = `${host}/users/${username}`

	const [newTask, setNewTask] = useState('')
	const [editTask, setEditTask] = useState('')
	const [editTaskCompleted, setEditTaskCompleted] = useState(false)
	const [isEdit, setIsEdit] = useState(false)
	const [editTodo, setEditTodo] = useState({})
	const [todos, setTodos] = useState([])

	const handleNewTask = (event) => {
		setNewTask(event.target.value)
	}

	const handleEditTask = (event) => {
		setEditTask(event.target.value)
	}

	const handleEditTaskCompleted = (event) => {
		setEditTaskCompleted(event.target.checked)
	}

	const getTodos = async () => {
		try {
			const response = await fetch(getUrl)
			if (!response.ok && response.status == 404) {
				await addUser()
				return
			}
			const data = await response.json()
			setTodos(Array.isArray(data) ? data : data.todos || [])
		} catch (error) {
			console.error("Error al cargar las tareas: ", error)
		}
	}

	const addUser = async () => {
		try {
			const response = await fetch(postUrlUserName, {
				method: "POST",
				body: JSON.stringify({
					name: username,
					todos: []
				}),
				headers: {
					"Content-Type": "application/json"
				}
			})
			if (response.ok) {
				await getTodos()
			}
		} catch (error) {
			console.error("Error al crear el usuario: ", error)
		}
	}

	const handleAddTask = async (event) => {
		event.preventDefault()
		if (newTask.trim() === "") return
		try {
			const response = await fetch(postUrl, {
				method: "POST",
				body: JSON.stringify({ label: newTask, is_done: false }),
				headers: {
					"Content-Type": "application/json"
				}
			})
			if (!response.ok) {
				console.log(response.status)
			}

			setNewTask('')
			await getTodos()
		} catch (error) {
			console.error("Error al agregar tarea: ", error)
		}
	}

	const handleEditIcon = (todo) => {
		setEditTask(todo.label)
		setEditTaskCompleted(todo.is_done)
		setEditTodo(todo)
		setIsEdit(true)
	}

	const handleSubmitEdit = async (event) => {
		event.preventDefault()
		if (editTask.trim() === "") return
		try {
			await fetch(`${host}/todos/${editTodo.id}`, {
				method: "PUT",
				body: JSON.stringify({
					label: editTask,
					is_done: editTaskCompleted
				}),
				headers: {
					"Content-Type": "application/json"
				}
			})
			setEditTask('')
			setEditTaskCompleted(false)
			setEditTodo({})
			setIsEdit(false)
			await getTodos()
		} catch (error) {
			console.error("Error modificando tarea: ", error)
		}
	}

	const handleDeletTask = async (id) => {
		try {
			await fetch(`${host}/todos/${id}`, {
				method: "DELETE"
			})
			await getTodos()
		} catch (error) {
			console.error("Error borrando la tarea: ", error)
		}
	}

	const handleCancel = () => {
		setIsEdit(false)
		setEditTodo({})
		setNewTask('')
		setEditTaskCompleted(false)
	}

	useEffect(() => {
		getTodos()
	}, [])

	return (
		<div className="container text-start d-flex flex-column align-items-center ">
			<div className="row">
				<h1 className='text-center text-primary'>Todo List with Fetch</h1>
				{isEdit ? (
					<form onSubmit={handleSubmitEdit} >
						<div className="bg-warning rounded p-4">
							<div className="col-12 col-md-10 col-lg-8 d-flex flex-column">
								<label>Edit Task</label>
								<input onChange={handleEditTask} type="text" value={editTask} className="form-control" />
								<div className="d-flex mt-2 gap-4">
									<input type="checkbox" checked={editTaskCompleted} onChange={handleEditTaskCompleted} />
									<label>Completed</label>
								</div>
								<div className="d-flex mt-3 gap-5">
									<button type="submit" className="btn btn-primary">Submit</button>
									<button type="button" onClick={handleCancel} className="btn btn-secondary">Cancel</button>
								</div>
							</div>
						</div>
					</form>
				) : (
					<form onSubmit={handleAddTask}>
						<div className="bg-warning rounded p-4">
							<div className="col-12 col-md-10 col-lg-8 d-flex flex-column">
								<label>Add Task</label>
								<input onChange={handleNewTask} type="text" value={newTask} className="form-control" />
							</div>
						</div>
					</form>
				)}
			</div>
			<div className="row w-100 my-4 justify-content-center">
				<h1 className='text-center text-success'>Todo List</h1>
				<div className="col-12 col-md-10 col-lg-8 col-xl-6 bg-dark rounded p-3">
					<ul className="list-group">
						{todos.length === 0 ? (
							<li className="list-group-item text-end">No tienes ninguna tarea.</li>
						) : (
							<>
								{
									todos.map(todo => (
										<li key={todo.id} className="list-group-item d-flex justify-content-between">
											<div className="me-3">
												{todo.is_done ? (
													<i className="fa-solid fa-thumbs-up text-success"></i>
												) : (
													<i className="fa-solid fa-ban text-danger"></i>
												)}
											</div>
											<span className={todo.is_done ? "text-decoration-line-through text-danger" : ""}>{todo.label}</span>
											<div className="d-flex ms-3 gap-2">
												<i onClick={() => handleEditIcon(todo)} className="fa-solid fa-pen-to-square text-success cursor-pointer" style={{ cursor: "pointer" }}></i>
												<i onClick={() => handleDeletTask(todo.id)} className="fa-solid fa-trash text-danger" style={{ cursor: "pointer" }}></i>
											</div>
										</li>
									))
								}
								< li className="list-group-item text-end">
									<span>
										{todos.filter(todo => !todo.is_done).length === 1 ? (
											`Hay ${todos.filter(todo => !todo.is_done).length} tarea pendiente`
										) : (
										`Hay ${todos.filter(todo => !todo.is_done).length} tareas pendientes`
											)}
									</span>
								</li>
							</>
						)}
					</ul>
				</div>
			</div>
		</div >
	);
};