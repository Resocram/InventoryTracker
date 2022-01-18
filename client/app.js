window.addEventListener('load',main,false);
function main(){
    document.getElementById("getAll").addEventListener("click", async function(){
        let response = await fetch('/inventory');
        let data = await response.json();
        convertJSONtoHTML(data)
    })

    document.getElementById("updateItem").addEventListener("click", async function(){
        let item = {
            name: document.getElementById("updateName").value,
            cost: document.getElementById("updateCost").value,
            quantity: document.getElementById("updateQuantity").value,
            country: document.getElementById("updateCountry").value,
            creationTime: document.getElementById("updateCreationTime").value,
            tags: document.getElementById("updateTags").value.split(','),
        }
        let response = await fetch('/inventory/'+document.getElementById("updateId").value,{
            method: "PUT",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        });
        response = await fetch('/inventory');
        let data = await response.json();
        convertJSONtoHTML(data)
    })

    document.getElementById("createItem").addEventListener("click", async function(){
        let item = {
            id: document.getElementById("createId").value,
            name: document.getElementById("createName").value,
            cost: document.getElementById("createCost").value,
            quantity: document.getElementById("createQuantity").value,
            country: document.getElementById("createCountry").value,
            tags: document.getElementById("createTags").value.split(','),
        }
        let response = await fetch('/inventory',{
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        });
        response = await fetch('/inventory');
        let data = await response.json();
        convertJSONtoHTML(data)
    })

    document.getElementById("deleteItem").addEventListener("click", async function(){
        let response = await fetch('/inventory/'+document.getElementById("deleteId").value,{
            method: "DELETE"
        });
        response = await fetch('/inventory');
        let data = await response.json();
        convertJSONtoHTML(data)
    })

    document.getElementById("getFilterItem").addEventListener("click", async function(){
        let attribute =  document.getElementById("getFilterAttribute").value;
        let comparator = document.getElementById("getFilterComparator").value;
        let value= document.getElementById("getFilterValue").value;
        
        let response = await fetch('/inventory/filter?attribute=' + attribute + 
        "&comparator=" + comparator + "&value=" + value);
        let data = await response.json();
        convertJSONtoHTML(data)
    })


}


function convertJSONtoHTML(JSON){
    let header = Object.getOwnPropertyNames(JSON[0])
    let table = document.createElement("table")
    let tr = table.insertRow(-1);
    
    // Add headers to table
    for(let i = 0; i<header.length;i++){
        let th = document.createElement("th");
        th.innerHTML = header[i];
        tr.appendChild(th);
    }

    // Add values to table
    for (let i = 0; i<JSON.length;i++){
        tr = table.insertRow(-1);
        for(let j = 0; j<header.length;j++){
            let cell = tr.insertCell(-1);
            cell.innerHTML = JSON[i][header[j]];
        }
    }
    
    let answer = document.getElementById("answer");
    answer.innerHTML = "Result: ";
    answer.appendChild(table)
}