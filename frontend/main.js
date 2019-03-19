const baseApiUrl = 'http://localhost:3000';

let updateToBackend = ({
    _id,
    title,
    color,
    status,
    completed,
}) => {
    fetch(baseApiUrl + '/tasks/' + _id, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                _id,
                title,
                color,
                status,
                completed
            })
        })
        .then(response => response)
        .catch(console.error)
}

function allowDrop(ev) {
    ev.preventDefault()
}
let drag = (ev) => {
    ev.dataTransfer.setData("id", ev.target.getAttribute("data-id"));
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("id");
    let finished = false;
    if (ev.target.className === 'done') finished = true;
    if (ev.target.className === 'porductBackLog' || ev.target.className === 'toDo' || ev.target.className === 'doing' || ev.target.className === 'done') {
        ev.target.appendChild(document.querySelector(`[data-id="${data}"] `));

        updateToBackend({
            _id: data,
            completed: finished,
            status: ev.target.className
        })
    } else if (ev.target.parentElement.className === 'porductBackLog' || ev.target.parentElement.className === 'toDo' || ev.target.parentElement.className === 'doing' || ev.target.parentElement.className === 'done') {
        ev.target.parentElement.appendChild(document.querySelector(`[data-id="${data}"] `));
        updateToBackend({
            _id: data,
            completed: finished,
            status: ev.target.parentElement.className
        })
    } else if (ev.target.parentElement.parentElement.className === 'porductBackLog' || ev.target.parentElement.parentElement.className === 'toDo' || ev.target.parentElement.parentElement.className === 'doing' || ev.target.parentElement.parentElement.className === 'done') {
        ev.target.parentElement.parentElement.appendChild(document.querySelector(`[data-id="${data}"] `));
        updateToBackend({
            _id: data,
            completed: finished,
            status: ev.target.parentElement.parentElement.className
        })
    } else if (ev.target.parentElement.parentElement.parentElement.className === 'porductBackLog' || ev.target.parentElement.parentElement.parentElement.className === 'toDo' || ev.target.parentElement.parentElement.parentElement.className === 'doing' || ev.target.parentElement.parentElement.parentElement.className === 'done') {
        ev.target.parentElement.parentElement.parentElement.appendChild(document.querySelector(`[data-id="${data}"] `));
        updateToBackend({
            _id: data,
            completed: finished,
            status: ev.target.parentElement.parentElement.parentElement.className
        })
    }
}
document.addEventListener('DOMContentLoaded', function () {
    const getTaskFromAPIRest = () => {
        // GET to /tasks
        fetch(baseApiUrl + '/tasks')
            .then(response => response.json())
            .then(tasks => {
                appendTasks(tasks);
            })
            .catch(console.error)
    }
    const appendTasks = tasksArray => {
        let tasksdiv = document.querySelector('main');
        tasksArray.forEach(task => {
            const taskNode = createTaskNode(task);
            document.querySelector('.' + taskNode.getAttribute('status')).appendChild(taskNode)
            taskNode.querySelector('.subtasks input').addEventListener('keyup', event => {
                if (event.keyCode === 13) {
                    addSubTask(taskNode, event.target.value)
                    event.target.value = '';
                }

            })
            taskNode.querySelector('.subtasks input').addEventListener('change', event => {
                taskNode.querySelector('.subtasks img').addEventListener('click', () => {
                    addSubTask(taskNode, event.target.value)
                    event.target.value = '';
                })
            })
            new Picker({
                parent: document.querySelector(`[data-id="${task._id}"] .color`),
                popup: "bottom",
                onChange: color => {
                    let rgba = ''
                    color._rgba.forEach((item) => {
                        rgba += ',' + item;
                    })
                    document.querySelector(`[data-id="${task._id}"]`).style.borderColor = `rgba(${rgba.slice(1)})`
                    updateToBackend({
                        _id: task._id,
                        color: `rgba(${rgba.slice(1)})`
                    })
                   // document.querySelector(`[data-id="${task._id}"] .color`).removeAttribute("style")
                }
            })
        })
    }
    const createTaskNode = taskObj => {
        let newTaskHtmlString = createTemplateHtmlString(taskObj)
        let taskNode = createNodeFromString(newTaskHtmlString)
        addRemoveListener(taskNode);
        addCompleteListener(taskNode);
        addTitleListener(taskNode);
        return taskNode;
    }
    let createTemplateHtmlString = ({
            _id,
            title,
            content,
            color,
            completed,
            status,
        }) =>
        `<div class="task ${completed ? 'completed': ''}" data-id="${_id}" style="border-color: ${color}" draggable="true" ondragstart="drag(event)" status=${status}>
            <div class="text" contenteditable spellcheck="false">${title}</div><div class="subtasks" data-contsent="${content}">
            <div class="addSubTask"><input type="text" placeholder="Add subtask" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Add subtask'"/><img src="./images/add.png" alt="add"></div></div>
            <div class=buttons><div class="color"><img class="color" src="./images/color.png"/></div><div class="complete"><img src="./images/completed.png"/></div>
            <div class="remove"><img src="./images/delete-512.png"/></div></div>
        </div>`
    let createNodeFromString = string => {
        let divNode = document.createElement('div');
        divNode.innerHTML = string;
        return divNode.firstChild;
    }
    let addRemoveListener = node => {
        node.querySelector('.remove').addEventListener('click', event => {
            node.remove();
            deleteTaskToBackend(node.getAttribute("data-id"))
        })
    }
    let addCompleteListener = node => {
        node.querySelector('.complete').addEventListener('click', event => {
            node.classList.toggle('completed')
            let state = ''
            if (node.getAttribute("class").endsWith('completed')) {
                state = 'done'
            } else state = 'porductBackLog'
            updateToBackend({
                _id: node.getAttribute("data-id"),
                completed: node.getAttribute("class").endsWith('completed'),
                status: state
            })
            if (node.classList.contains('completed')) {
                document.querySelector('.done').appendChild(node)
            } else {
                document.querySelector('main').appendChild(node);
            }
        })
    }
    let addTitleListener = node => {
        node.querySelector('.text').addEventListener('blur', event => {
            let title = node.querySelector('.text').innerHTML;
            updateToBackend({
                _id: node.getAttribute("data-id"),
                title: title
            })
        })
    }
    let saveTaskToBackend = title => {
        return fetch(baseApiUrl + '/tasks', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    status: 'porductBackLog'
                })
            })
            .then(response => (response.json()))
            .then(res => res)
            .catch(console.error)
    }
    let deleteTaskToBackend = id => {
        fetch(baseApiUrl + '/tasks/' + id, {
                method: 'DELETE',
            })
            .then(response => response)
            .catch(console.error)
    }

    let inputNode = document.querySelector('header input');
    inputNode.addEventListener('keyup', function (event) {
        if (event.keyCode === 13) {
            let title = event.target.value;
            saveTaskToBackend(title).then(res => {
                let newTaskHtmlString = createTemplateHtmlString({
                    _id: res.task._id,
                    title: title,
                    status: 'porductBackLog'
                })
                let newTaskNode = createNodeFromString(newTaskHtmlString)
                document.querySelector('main').appendChild(newTaskNode)
                event.target.value = '';

                addRemoveListener(newTaskNode);
                addCompleteListener(newTaskNode);
                addTitleListener(newTaskNode);
                newTaskNode.querySelector('.subtasks input').addEventListener('keyup', event => {
                    if (event.keyCode === 13) {
                        addSubTask(newTaskNode, event.target.value)
                        event.target.value = '';
                    }
    
                })
                newTaskNode.querySelector('.subtasks input').addEventListener('change', event => {
                    newTaskNode.querySelector('.subtasks img').addEventListener('click', () => {
                        addSubTask(newTaskNode, event.target.value)
                        event.target.value = '';
                    })
                })
                new Picker({
                    parent: document.querySelector(`[data-id="${res.task._id}"] .color`),
                    popup: "botom",
                    onChange: function (color) {
                        let rgba = ''
                        color._rgba.forEach((item) => {
                            rgba += ',' + item;
                        })
                        updateToBackend({
                            _id: res.task._id,
                            color: `rgba(${rgba.slice(1)})`
                        })
                        document.querySelector(`[data-id="${res.task._id}"]`).style.borderColor = `rgba(${rgba.slice(1)})`
                    }
                })
            })
        }
    })
    let addSubTask = (parentNode, subTask) => {
        let subTaskNode = document.createElement('div');
        subTaskNode.innerHTML = `<p contenteditable="true">◻️  ${subTask}</p>`;
        parentNode.querySelector('.subtasks').appendChild(subTaskNode.firstChild)
    }
    getTaskFromAPIRest();

});