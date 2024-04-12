document.addEventListener('DOMContentLoaded', function () {
    const addTaskForm = document.getElementById('add-task-form');
    const editTaskForm = document.getElementById('edit-task-form');
    const closeFormButton = document.getElementById('close-form-btn');
    const closeEditFormButton = document.getElementById('close-edit-form-btn');
    const overlay = document.querySelector('.overlay');

    const todoColumn = document.getElementById('todo');
    const doingColumn = document.getElementById('doing');
    const completedColumn = document.getElementById('completed');
    const blockedColumn = document.getElementById('blocked');

    let tasks = [];
    let editingTaskIndex = null;
    let draggedTask = null;
    let editedTaskStatus = null; // Thêm biến để lưu trạng thái mới của task khi người dùng chỉnh sửa

    function saveTasksToLocalStorage() {
        const validTasks = tasks.filter(task => task.type && task.title && task.description);
        localStorage.setItem('mytasks', JSON.stringify(validTasks));
    }

    function getTaskFromLocalStorage() {
        return JSON.parse(localStorage.getItem('mytasks')) || [];
    }

    tasks = getTaskFromLocalStorage();

    tasks.forEach(function (task, index) {
        addTaskToTodoList(task, index);
    });

    function preventClickOnForm(event) {
        event.stopPropagation();
    }

    overlay.addEventListener('click', function () {
        hideAddTaskForm();
        hideEditTaskForm();
    });

    function hideAddTaskForm() {
        addTaskForm.style.display = 'none';
        overlay.style.display = 'none';
        addTaskForm.removeEventListener('click', preventClickOnForm);
    }

    function hideEditTaskForm() {
        editTaskForm.style.display = 'none';
        overlay.style.display = 'none';
        editTaskForm.removeEventListener('click', preventClickOnForm);
        editedTaskStatus = null; // Đặt lại giá trị của biến khi form chỉnh sửa bị ẩn đi
    }

    const newTaskButton = document.querySelector('.new-task-btn');

    newTaskButton.addEventListener('click', function () {
        addTaskForm.style.display = 'block';
        document.getElementById('task-form').reset();
        overlay.style.display = 'block';
        addTaskForm.addEventListener('click', preventClickOnForm);
    });

    closeFormButton.addEventListener('click', function () {
        hideAddTaskForm();
    });

    closeEditFormButton.addEventListener('click', function () {
        hideEditTaskForm();
    });

    function addTaskToTodoColumn(task) {
        const oldColumn = getTaskStatus(tasks.length - 1);
        if (oldColumn !== 'todo') {
            // Loại bỏ task khỏi cột nguồn nếu nó thực sự nằm trong cột đó
            removeTaskFromColumn(tasks.length - 1, oldColumn);
        }

        task.column = 'todo';
        tasks.push(task);
        saveAndRenderTasks();
    }

    function getTaskStatus(index) {
        return tasks[index].column;
    }

    function selectRadioButtonForTaskEdit(index) {
        const taskStatus = getTaskStatus(index);
        if (taskStatus) {
            const radioButton = document.querySelector(`input[name="edit-task-status"][value="${taskStatus}"]`);
            if (radioButton) {
                radioButton.checked = true;
            }
        }
    }

    addTaskToTodoColumn({
        type: '',
        title: '',
        description: ''
    });

    function addTaskAndUpdateDOM(task, index) {
        addTaskToTodoList(task, index); // Thêm task mới vào DOM
        updateTaskCounts(); // Cập nhật số lượng task trong các cột
    }

    // Thêm sự kiện focus và blur cho các input và textarea trong form add task
    const addTaskInputs = addTaskForm.querySelectorAll('input, textarea');
    addTaskInputs.forEach(input => {
        input.addEventListener('focus', function () {
            input.classList.remove('error');
        });
        input.addEventListener('blur', function () {
            if (!input.value.trim()) {
                input.classList.add('error');
            }
        });
    });

    // Thêm sự kiện focus và blur cho các input và textarea trong form edit task
    const editTaskInputs = editTaskForm.querySelectorAll('input, textarea');
    editTaskInputs.forEach(input => {
        input.addEventListener('focus', function () {
            input.classList.remove('error');
        });
        input.addEventListener('blur', function () {
            if (!input.value.trim()) {
                input.classList.add('error');
            }
        });
    });

    // Thêm sự kiện submit cho form add task
    addTaskForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const taskType = document.querySelector('#task-type');
        const taskTitle = document.querySelector('#task-title');
        const taskDescription = document.querySelector('#task-description');

        // Kiểm tra xem các trường có giá trị không
        if (taskType.value.trim() && taskTitle.value.trim() && taskDescription.value.trim()) {
            const newTask = createTask(taskType.value.trim(), taskTitle.value.trim(), taskDescription.value.trim());
            addTaskToTodoColumn(newTask);
            addTaskAndUpdateDOM(newTask, tasks.length - 1);
            addTaskForm.style.display = 'none';
            hideAddTaskForm();
        } else {
            // Thêm lớp error và sự kiện blur vào các input hoặc textarea chưa điền
            addTaskInputs.forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add('error');
                }
            });
        }
    });

    // Thêm sự kiện submit cho form edit task
    document.getElementById('edit-submit-btn').addEventListener('click', function (event) {
        event.preventDefault();
        const indexToEdit = parseInt(editTaskForm.dataset.indexToEdit);
        const editTaskType = document.querySelector('#edit-task-type').value.trim();
        const editTaskTitle = document.querySelector('#edit-task-title').value.trim();
        const editTaskDescription = document.querySelector('#edit-task-description').value.trim();
        const editTaskStatus = editedTaskStatus || document.querySelector('input[name="edit-task-status"]:checked').value;

        // Kiểm tra xem các trường có giá trị không
        if (editTaskType !== '' && editTaskTitle !== '' && editTaskDescription !== '') {
            tasks[indexToEdit].type = editTaskType;
            tasks[indexToEdit].title = editTaskTitle;
            tasks[indexToEdit].description = editTaskDescription;
            tasks[indexToEdit].column = editTaskStatus;

            editTaskForm.style.display = 'none';
            hideEditTaskForm();
            saveAndRenderTasks();
            editedTaskStatus = null; // Reset biến tạm thời sau khi đã cập nhật vào task
        } else {
            // Thêm lớp error và sự kiện blur vào các input hoặc textarea chưa điền
            editTaskInputs.forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add('error');
                }
            });
        }
    });


    // Hàm xóa lớp error khi input hoặc textarea nhận sự kiện blur
    function removeErrorClass(event) {
        event.target.classList.remove('error');
        // Xóa thông báo lỗi nếu có
        const errorMessage = event.target.parentElement.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    function removeTaskFromColumn(index, columnId) {
        const column = document.getElementById(columnId);
        if (column) {
            const taskElement = column.querySelector(`.task[data-index="${index}"]`);
            if (taskElement && taskElement.parentElement === column) { // Chỉ xóa task nếu nó nằm trong cột được chỉ định
                taskElement.remove();
            }
        }
    }


    function moveTaskToColumn(index, column) {
        const taskElement = document.querySelector(`.task[data-index="${index}"]`);
        const targetColumn = document.getElementById(column);
        if (taskElement && targetColumn) {
            const currentColumnId = taskElement.parentElement.id;
            if (currentColumnId !== column) {
                targetColumn.appendChild(taskElement);
                tasks[index].column = column;
                saveTasksToLocalStorage();
                // removeTaskFromColumn(index, currentColumnId); // Xóa task khỏi cột hiện tại
                saveAndRenderTasks();
            }
        }
    }

    function handleEditTaskStatusChange(event) {
        editedTaskStatus = event.target.value; // Lưu trạng thái mới vào biến tạm thời
    }

    const editTaskStatusRadios = document.querySelectorAll('input[name="edit-task-status"]');
    editTaskStatusRadios.forEach(radio => {
        radio.addEventListener('change', handleEditTaskStatusChange);
    });

    function createTask(type, title, description) {
        return {
            type: type,
            title: title,
            description: description
        };
    }

    function addTaskToTodoList(task, index) {
        const todoColumn = document.querySelector('#todo');

        if (!task || !task.type || !task.title || !task.description) {
            console.error("Invalid task:", task);
            return;
        }

        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;

        const taskElement = document.createElement('div');
        taskElement.classList.add('task');
        taskElement.dataset.index = index;
        taskElement.innerHTML = `<div class="task-header">
            <div class="task-type-title">
                <div class="task-type">${task.type}</div>
                <div class="task-title">${task.title}</div>
            </div>
            <div class="task-buttons">
                <button class="btn-edit"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-delete"><i class="fa-solid fa-trash"></i></button>
            </div>
        </div>
        <div class="task-description">${task.description}</div>
        <div class="task-date"><i class="fa-regular fa-clock"></i> ${formattedDate}</div>`;

        taskElement.draggable = true;

        todoColumn.appendChild(taskElement);

        const deleteButton = taskElement.querySelector('.btn-delete');
        deleteButton.addEventListener('click', function (event) {
            const taskElement = deleteButton.closest('.task');
            const indexToDelete = parseInt(taskElement.dataset.index);
            tasks.splice(indexToDelete, 1);
            taskElement.remove();
            for (let i = indexToDelete; i < tasks.length; i++) {
                const taskElement = document.querySelector(`.task[data-index="${i + 1}"]`);
                if (taskElement) {
                    taskElement.dataset.index = i;
                }
            }
            saveTasksToLocalStorage();
            updateTaskCounts();
        });

        const editButton = taskElement.querySelector('.btn-edit');
        editButton.addEventListener('click', function (event) {
            const indexToEdit = parseInt(taskElement.dataset.index);
            editingTaskIndex = parseInt(taskElement.dataset.index);
            document.querySelector('#edit-task-type').value = task.type;
            document.querySelector('#edit-task-title').value = task.title;
            document.querySelector('#edit-task-description').value = task.description;
            editTaskForm.dataset.indexToEdit = indexToEdit;
            editTaskForm.style.display = 'block';
            overlay.style.display = 'block';
            editTaskForm.addEventListener('click', preventClickOnForm);
            selectRadioButtonForTaskEdit(indexToEdit);
        });

        const editTaskStatusRadios = taskElement.querySelectorAll('input[name="edit-task-status"]');
        editTaskStatusRadios.forEach(radio => {
            radio.addEventListener('change', handleEditTaskStatusChange);
        });
    }

    function updateTaskCounts() {
        const todoCount = todoColumn.querySelectorAll('.task').length;
        const doingCount = doingColumn.querySelectorAll('.task').length;
        const completedCount = completedColumn.querySelectorAll('.task').length;
        const blockedCount = blockedColumn.querySelectorAll('.task').length;

        todoColumn.querySelector('.task-count').textContent = todoCount;
        doingColumn.querySelector('.task-count').textContent = doingCount;
        completedColumn.querySelector('.task-count').textContent = completedCount;
        blockedColumn.querySelector('.task-count').textContent = blockedCount;

        if (todoCount === 0) {
            setDefaultColumn();
        }
    }

    function setDefaultColumn() {
        const todoColumn = document.getElementById('todo');
        const todoCount = todoColumn.querySelectorAll('.task').length;
        if (todoCount === 0) {
            todoColumn.classList.add('active');
            const otherColumns = document.querySelectorAll('.task-column:not(#todo)');
            otherColumns.forEach(column => column.classList.remove('active'));
        }
    }

    function saveAndRenderTasks() {
        saveTasksToLocalStorage();

        tasks.forEach((task, index) => {
            const currentColumn = document.getElementById(task.column);
            if (currentColumn) {
                const existingTaskElement = currentColumn.querySelector(`.task[data-index="${index}"]`);
                if (existingTaskElement) {
                    existingTaskElement.querySelector('.task-type').textContent = task.type;
                    existingTaskElement.querySelector('.task-title').textContent = task.title;
                    existingTaskElement.querySelector('.task-description').textContent = task.description;
                } else {
                    moveTaskToColumn(index, task.column);
                }
            }
        });

        updateTaskCounts();
    }

    document.addEventListener('dragstart', function (event) {
        if (event.target.classList.contains('task')) {
            draggedTask = event.target;
            draggedTask.classList.add('dragging');
        }
    });

    document.addEventListener('dragend', function (event) {
        if (draggedTask) {
            draggedTask.classList.remove('dragging');
            draggedTask = null;
        }
    });

    function handleDragOver(event) {
        event.preventDefault();
    }

    function handleDrop(event) {
        if (draggedTask) {
            const targetColumn = event.target.closest('.task-column');
            if (targetColumn && targetColumn !== draggedTask.parentElement) {
                targetColumn.appendChild(draggedTask);
                const index = parseInt(draggedTask.dataset.index);
                const newColumnId = targetColumn.id;
                tasks[index].column = newColumnId;
                saveTasksToLocalStorage(); // Lưu vị trí mới của task sau khi di chuyển
            }
            draggedTask.classList.remove('dragging');
            draggedTask = null;
            updateTaskCounts();
        }
    }

    [todoColumn, doingColumn, completedColumn, blockedColumn].forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('drop', handleDrop);
    });

    updateTaskCounts();

    // Đặt chiều cao cho các cột dựa trên nội dung của chúng
    function setColumnHeight() {
        const taskColumns = document.querySelectorAll('.task-column');
        taskColumns.forEach(column => {
            const contentHeight = column.scrollHeight;
            column.style.height = `${contentHeight}px`;
        });
    }

    // Gọi hàm khi tài liệu được tải và khi kích thước cửa sổ thay đổi
    window.addEventListener('DOMContentLoaded', setColumnHeight);
    window.addEventListener('resize', setColumnHeight);

}); 