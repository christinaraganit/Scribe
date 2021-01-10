


var datas = []
var graphDatas = []
var currentProject = 0


if (document.getElementById('chart')){
    //for init only
auth.onAuthStateChanged(async user => {
    if (user){
        //await makeNewProject(80000, 30, new Date().getTime(), 'awsd');
        await loadProjects(user);
        if (datas.length > 0){
            displayGraph(0);
        }
    }
})

}





function dateToMD(date) {
    var strArray=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var d = date.getDate();
    var m = strArray[date.getMonth()];
    return '' + (d <= 9 ? '0' + d : d) + '-' + m;
}



//arr, arr, date, int
function displayGraph(index) {
    var ctx = document.getElementById('chart')
    var project = datas[index];
    log(datas);
    log(index)
    var data = {
        labels:[],
        datasets:[
            {
            label:"Target",
            backgroundColor: 'rgba(5,195,154,0.2)',
            borderColor:'rgba(5,195,154,1)',
            borderWidth: 2,
            data: project['targetWords'],
        }, 
        {
            label: "Currentl words",
            backgroundColor: 'rgba(10, 102, 141, 0.2)',
            borderColor:'rgba(10, 102, 141,1)',
            borderWidth: 2,
            data: project['currentWords'],
        }
    ]
    };
    var options = {
        tooltips: {
            mode: 'index',
            intersect: false
        },
        responsive: true,
        scales: {
            xAxes: [{
                stacked: true,
            }],
            yAxes: [{
                stacked: false,
                ticks: {
                    beginAtZero: true,
                    
                }
            }]
        },
        
    };
    log(project['currentWords']);
    options['scales']['yAxes'][0]['ticks']['suggestedMax'] = Math.max(...project['targetWords']) * 1.25;
    var i;
    for (i=0; i < project['days']; i++){
        //
        data['labels'].push(dateToMD(new Date(project['startDate'] + 86400000 * i)));
    }
    
    graphDatas = data;
    var chart = new Chart(ctx.getContext('2d'), 
        {  
        type : 'bar',
        data : graphDatas,
        options : options,
        events :['click']
    });

    ctx.onclick = (event) =>{
        log(chart.getElementsAtEvent(event));
    };
  

}

function updateDashBoard(index){

}


async function loadProjects(user){
    console.log(user.email);
    await db.collection(user.email).where('name', '!=', null).get()
        .then(snapshot =>{
            snapshot.forEach(doc => {
                data = doc.data();
                data["id"] = doc.id; 
                datas.push(data);
            })
        });
    
    const container = document.getElementById("project-container");
    if (container){
        var str = "";

        for (var i = 0; i < datas.length; i++){
            str =str + `<div >
            <div style="margin: 8px" id=${i}
              class="uk-card uk-height-small uk-width-small uk-margin-small-right uk-card-default uk-card-body">
              <h5 style="text-align: center">${datas[i]['name']}</h5>
            </div>
          </div>`
        }
        container.innerHTML = str;
        for (var i = 0; i < datas.length; i++){
            log(i);
            document.getElementById(`${i}`).addEventListener('click', e=>{
                currentProject = i;
                displayGraph(i);
                updateDashBoard(i);
                
            });
        }
    }
}


const newButt = document.getElementById("newproject-button");

if (newButt){
    newButt.addEventListener('click',e=>{
        window.location.href = 'newproject.html';
    });
}

const createButton = document.getElementById("create-button");

if (createButton){
    log('entering on click stff');
    createButton.addEventListener('click', async(e) =>{

        log('entering on click button');
        const title = document.getElementById('newproject-title').value;
        const goal = document.getElementById('newproject-goal').value;
        const days = document.getElementById('newproject-days').value;
        const date = document.getElementById('newproject-date').value;
        
        await makeNewProject(parseInt(goal), parseInt(days),new Date(date).getTime(), title);
        window.location.href ="home.html";
    });
}

const logoutButton = document.getElementById("logout-button");
if (logoutButton){
    logoutButton.addEventListener('click', (e) =>{
        auth.signOut();
        window.location.href ="index.html";

    });
}

async function makeNewProject(wordCount, days, startDate, projectName){
    const avg = Math.round(wordCount/days);
    var currentData = [];
    var targetData = [];
    for (var i=0; i < days; i++){
        currentData.push(0);
        targetData.push(avg);
    }
    const email = auth.currentUser.email;
    
    db.collection(email).doc(projectName).set({
        currentWords : currentData,
        targetWords : targetData,
        name: projectName,
        startDate:startDate,
        totalWordCount: wordCount, 
        days: days
    });
    await loadProjects(auth.currentUser);
}




function log(stuff){
    console.log(stuff);
}