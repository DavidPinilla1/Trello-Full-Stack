const baseApiUrl = 'http://localhost:3000';
const subTasks = {}
const WhenDropAddToDOMandUpdateToBackend = (data, ev) => {
    const list = ev.target.className;
    const list2 = ev.target.parentElement.className;
    const list3 = ev.target.parentElement.parentElement.className;
    const list4 = ev.target.parentElement.parentElement.parentElement.className;
    if (list === 'porductBackLog' || list === 'toDo' || list === 'doing' || list === 'done') {
        ev.target.appendChild(document.querySelector(`[data-id="${data}"] `));

        updateToBackend({
            _id: data,
            list: list
        })
    } else if (list2 === 'porductBackLog' || list2 === 'toDo' || list2 === 'doing' || list2 === 'done') {
        ev.target.parentElement.appendChild(document.querySelector(`[data-id="${data}"] `));
        updateToBackend({
            _id: data,
            list: list2
        })
    } else if (list3 === 'porductBackLog' || list3 === 'toDo' || list3 === 'doing' || list3 === 'done') {
        ev.target.parentElement.parentElement.appendChild(document.querySelector(`[data-id="${data}"] `));
        updateToBackend({
            _id: data,
            list: list3
        })
    } else if (list4 === 'porductBackLog' || list4 === 'toDo' || list4 === 'doing' || list4 === 'done') {
        ev.target.parentElement.parentElement.parentElement.appendChild(document.querySelector(`[data-id="${data}"] `));
        updateToBackend({
            _id: data,
            list: list4
        })
    }
}
const updateToBackend = ({
    _id,
    title,
    color,
    content,
    list
}) => {
    return fetch(baseApiUrl + '/tasks/' + _id, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                _id,
                title,
                color,
                content,
                list
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
    const data = ev.dataTransfer.getData("id");
    WhenDropAddToDOMandUpdateToBackend(data, ev)
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
    const subTasks = {}
    const appendTasks = tasksArray => {
        tasksArray.forEach(task => {
            const taskNode = createTaskNode(task);
            document.querySelector('.' + taskNode.getAttribute('list')).appendChild(taskNode)
            addContentListeners(taskNode)
            if (Object.values(task).indexOf(task.content) > -1) {
                subTasks[task._id] = task.content
                task.content.forEach(subTaskObject => {
                    let subTaskNode = document.createElement('div');
                    subTaskNode.innerHTML = `<p contenteditable="true" data-subid="sacalo del backend" data-id="${subTaskObject._id}">◻️ - ${subTaskObject.subTask}</p>`;
                    taskNode.querySelector('.subtasks').appendChild(subTaskNode.firstChild)

                })
            }


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
    const createTemplateHtmlString = ({
            _id,
            title,
            content,
            color,
            list,
        }) =>
        `<div class="task" data-id="${_id}" style="border-color: ${color}" draggable="true" ondragstart="drag(event)" list=${list}>
            <div class="text" contenteditable spellcheck="false">${title}</div><div class="subtasks" data-contsent="${content}">
            <div class="addSubTask">
                <input type="text" placeholder="Add subtask" onfocus="this.placeholder = ''" onblur="this.placeholder = 'Add subtask'"/>
                <img class="add" src="./images/add.png" alt="add"></div>
            </div>
            <div class=buttons>
                <div class="color">
                    <img class="color" src="./images/color.png"/>
                </div>
                <div class="complete">
                    <img src="./images/completed.png"/>
                </div>
                <div class="remove">
                    <img src="./images/delete-512.png"/>
                </div>
            </div>
        </div>`
    const createNodeFromString = string => {
        let divNode = document.createElement('div');
        divNode.innerHTML = string;
        return divNode.firstChild;
    }
    const addRemoveListener = node => {
        node.querySelector('.remove').addEventListener('click', event => {
            node.remove();
            deleteTaskToBackend(node.getAttribute("data-id"))
        })
    }
    const addCompleteListener = node => {
        node.querySelector('.complete').addEventListener('click', event => {
            node.classList.toggle('completed')
            let state = ''
            if (node.getAttribute("class").endsWith('completed')) {
                state = 'done'
            } else state = 'porductBackLog'
            updateToBackend({
                _id: node.getAttribute("data-id"),
                list: state
            })
            if (node.classList.contains('completed')) {
                document.querySelector('.done').appendChild(node)
            } else {
                document.querySelector('main').appendChild(node);
            }
        })
    }
    const addTitleListener = node => {
        node.querySelector('.text').addEventListener('blur', event => {
            let title = node.querySelector('.text').innerHTML;
            updateToBackend({
                _id: node.getAttribute("data-id"),
                title: title
            })
        })
    }
    const addContentListeners = node => {
        node.querySelector('.subtasks input').addEventListener('keyup', event => {
            if (event.keyCode === 13) {
                if (event.target.value.length > 0) addSubTask(node, event.target.value)
                event.target.value = '';
            }

        })
        node.querySelector('.subtasks input').addEventListener('change', event => {
            node.querySelector('.subtasks img').addEventListener('click', () => {
                if (event.target.value.length > 0) addSubTask(node, event.target.value)
                event.target.value = '';
            })
        })
    }
    document.querySelector('.signUpButton').addEventListener('click', () => {
        //console.log(document.querySelector("*:not(.register)").classList.toggle('modal-open'))
        document.querySelector("body").classList.toggle('modal-open');
        document.querySelector('.register').classList.toggle('visible')
    })
    const saveTaskToBackend = title => {
        return fetch(baseApiUrl + '/tasks', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    list: 'porductBackLog'
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
    const addSubTask = (parentNode, subTask) => {
        let subTaskNode = document.createElement('div');
        const id = parentNode.getAttribute("data-id");
        if (subTasks[`${id}`]) {
            let subTasksArr = subTasks[`${id}`]
            subTasks[`${id}`].push({
                subTask,
                completed: false
            })
            updateToBackend({
                _id: id,
                content: subTasksArr
            })
        } else updateToBackend({
            _id: id,
            content: [{
                subTask,
                completed: false
            }]
        })
        subTaskNode.innerHTML = `<p contenteditable="true" data-id="sacalo del backend">◻️ - ${subTask}</p>`;
        parentNode.querySelector('.subtasks').appendChild(subTaskNode.firstChild)
    }
    let inputNode = document.querySelector('header input');
    inputNode.addEventListener('keyup', function (event) {
        if (event.keyCode === 13) {
            let title = event.target.value;
            saveTaskToBackend(title).then(res => {
                let newTaskHtmlString = createTemplateHtmlString({
                    _id: res.task._id,
                    title: title,
                    list: 'porductBackLog'
                })
                let newTaskNode = createNodeFromString(newTaskHtmlString)
                document.querySelector('main').appendChild(newTaskNode)
                event.target.value = '';
                subTasks[res.task._id] = []
                addRemoveListener(newTaskNode);
                addCompleteListener(newTaskNode);
                addTitleListener(newTaskNode);
                addContentListeners(newTaskNode)
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
    getTaskFromAPIRest();

});