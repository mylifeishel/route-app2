"use strict"
let jsonData
let district

fetch("facility-fw.json")
  .then((response) => response.json())
  .then((data) => {
    jsonData = data
  })
  .then(() => console.log(jsonData[0]))
  .then(() => generateTable(jsonData))
  .then(() => district = jsonData.map(x => x['District_en']))
  .then(district => district.reduce(
    (a, c) => (a[c] = (a[c] || 0) + 1, a), Object.create(null))
  )
  .then(obj => Object.keys(obj).map(x => ({district: x, count: obj[x]})))
  .then(data => generateChart(data))

function generateTable(dataSet) {
  const tdiv = document.querySelector('#table')
  const tbl = document.createElement("table");
  const tblHead = document.createElement("thead")
  const tblBody = document.createElement("tbody");
  const header = ['Title', 'District', 'Route']
  const attrs = ['Title_en', 'District_en', 'Route_en']

  const headerRow = document.createElement("tr");
  header.forEach(element => {
    const cell = document.createElement("th")
    const cellText = document.createTextNode(element)
    cell.appendChild(cellText)
    headerRow.appendChild(cell)
  })

  tblHead.appendChild(headerRow)

  dataSet.forEach(element => {
    const row = document.createElement("tr");

    attrs.forEach(attr => {
      const cell = document.createElement("td");
      const cellText = document.createTextNode(element[attr].replace(/<br\s*\/?>/mg,"\n"))
      cell.appendChild(cellText)
      row.appendChild(cell)
    })

    const cells = Array.from(row.querySelectorAll('td'))
    for (let i = 0; i < cells.length; i++) {
      cells[i].setAttribute('data-label', header[i])
    }

    const utils = document.createElement("div")
    const cell = document.createElement("td")
    cell.setAttribute('class', 'utils')
    
    utils.appendChild(generateButton('Copy', function() {
      const str = cells.map(ele => ele.textContent).join('\n').concat('\n')
      console.log(cells)
      console.log(str)
      navigator.clipboard.writeText(str)
    }))

    utils.appendChild(generateButton('Map', function() {
      const latitude = element['Latitude']
      const longitude = element['Longitude']
      window.open(`https://www.google.com/maps/search/?api=1&query=${latitude}%2C${longitude}`)
    }))

    cell.appendChild(utils)
    row.appendChild(cell)

    tblBody.appendChild(row)
  })

  tbl.appendChild(tblHead)
  tbl.appendChild(tblBody)
  tdiv.appendChild(tbl)
}

function generateButton(text, buttonCallback) {
  const button = document.createElement('button')
  const buttonText = document.createTextNode(text)
  button.onclick = buttonCallback

  button.appendChild(buttonText)
  return button
}

function searchTable() {
  console.log('key')
  const trs = document.querySelectorAll('#table tbody tr')
  console.log(trs)
  const filter = document.querySelector('#searchString').value
  const regex = new RegExp(filter, 'i')
  const isFoundInTds = td => regex.test(td.innerHTML)
  const isFound = childrenArr => childrenArr.some(isFoundInTds)
  const setTrStyleDisplay = ({ style, children }) => {
    style.display = isFound([
      ...children // <-- All columns
    ]) ? '' : 'none' 
  }
  
  trs.forEach(setTrStyleDisplay)
}


function generateChart(data) {
  new Chart(
    document.getElementById('districts'),
    {
      type: 'pie',
      data: {
        labels: data.map(row => row.district),
        datasets: [
          {
            data: data.map(row => row.count)
          }
        ]
      }
    }
  );
}

