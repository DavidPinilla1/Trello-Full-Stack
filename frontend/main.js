document.addEventListener('DOMContentLoaded', function () {
    // Declarations

    const baseApiUrl = 'http://localhost:3000';
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
            tasksdiv.appendChild(taskNode);
            new Picker({
                parent: document.querySelector(`[data-id="${task._id}"]`),
                popup:  "botom",
                onChange: function (color) {
                    let rgba=''
                    color._rgba.forEach((item)=>{
                        rgba+=','+item;
                    })
                    console.log(task._id)
                    updateToBackend({
                        _id:task._id,
                        color: `rgba(${rgba.slice(1)})`
                    })
                    document.querySelector(`[data-id="${task._id}"]`).style.borderColor = `rgba(${rgba.slice(1)})`
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
        }) =>
        `<div class="task ${completed ? 'completed': ''}" data-id="${_id}" style="border-color: ${color}">
            <div class="text">${title}</div><input type="hidden" class="title"/><button class="complete">Complete</button>
            <button class="remove">Remove</button>
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
            updateToBackend({
                _id: node.getAttribute("data-id"),
                title: node.querySelector('.text').innerHTML,
                color: node.style.borderColor,
                completed: node.getAttribute("class").endsWith('completed')
            })
        })
    }
    let addTitleListener = node => {
        node.querySelector('.text').addEventListener('click', event => {
            node.querySelector('.text').remove()
            node.querySelector('.title').setAttribute("type", "text");
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
                    title
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
    let updateToBackend = ({
        _id,
        title,
        color,
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
                    completed
                })
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
                })
                let newTaskNode = createNodeFromString(newTaskHtmlString)
                document.querySelector('main').appendChild(newTaskNode)

                event.target.value = '';

                addRemoveListener(newTaskNode);
                addCompleteListener(newTaskNode);
                addTitleListener(newTaskNode);

                new Picker({
                    parent: document.querySelector(`[data-id="${res.task._id}"]`),
                    popup: false,
                    onChange: function (color) {
                        let rgba=''
                        color._rgba.forEach((item)=>{
                            rgba+=','+item;
                        })
                        updateToBackend({
                            _id:res.task._id,
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