
    /*
    fetch('https://api.ipgeolocation.io/ipgeo?apiKey=7f88fb3ec87943a081607365355b443e' )
    .then(response => response.json())
    .then(data => {

      console.log(data)

      const userCity = data.city;
      const userCountry = data.country_name;
      const networkCards = document.querySelectorAll('div[class = "network-info-card mt-3 p-3 d-flex flex-column justify-content-around"]>p')
      networkCards[0].textContent = data.ip
      networkCards[1].textContent = (data.city+","+data.country_name)

      console.log('User Country:', userCountry);
    })
    .catch(error => {
      console.error('Error:', error);
    });*/

async function getMeasure(date){
  let response = await fetch(
    "http://localhost:8000/getMeasure?date="+date
  );
  let data = await response.json();
  

  const measureData = document.querySelectorAll('div[class="measure-info-card mt-3 p-3 d-flex flex-column justify-content-around"]>p')

  measureData[0].textContent = data[0].address_of_measure
  measureData[1].textContent = formateDate(data[0].date_time_of_measure)
  
  const inputs = document.querySelectorAll('input[type="text"]')

  const canvas = document.querySelectorAll('canvas')

  inputs[1].value= String( (235+ (Math.random() * (7.652 - (-6.421)) + -6.421)).toFixed(2)) + "V"
  inputs[2].value= String( (332+ (Math.random() * (7.652 - (-6.421)) + -6.421)).toFixed(2)) + "V"
  inputs[3].value= String( (60+ (Math.random() * (0.25 - (-0.3)) + -0.2)).toFixed(2)) + "Hz"
  inputs[4].value= String( (16.66+ (Math.random() * (0.150 - (-0.200)) + -0.200)).toFixed(2)) + "ms"

  chart1.data.datasets[0].data = data[0].measures.signal
  chart1.data.datasets[1].data = data[0].measures.peak
  chart1.data.datasets[2].data = data[0].measures.zerocross
  chart1.data.labels = data[0].measures.tempo
  
  chart2.data.datasets[0].data = data[0].measures.signal
  chart2.data.datasets[1].data = recreateSignal(data[0].measures.signal)
  chart2.data.labels = data[0].measures.tempo
 
  chart1.update()
  chart2.update()
  
}


async function getDates() {
  let response = await fetch(
    "http://localhost:8000/getallDates"
  );
  let data = await response.json();

  const options = await data
  const menu = document.querySelector("ul")
  menu.innerHTML = ""
  for(let i = 0; i < options.length;i++){
    const element = document.createElement('li');
    element.textContent = formateDate(options[i]['date_time_of_measure']);
    element.classList.add('p3','text-dark')
    element.addEventListener('click',function(event){
      document.querySelector('input[type="text"]').value = event.target.textContent
      getMeasure(event.target.textContent)
    })
    menu.append(element)
  }
  
}

function formateDate(dateString){
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  const hours = ("0" + date.getHours()).slice(-2);
  const minutes = ("0" + date.getMinutes()).slice(-2);
  const seconds = ("0" + date.getSeconds()).slice(-2);
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return(formattedDate);
}

//Function dedicated to recreate the power grid signal
function recreateSignal(signal) {
  let sampleCount = 0

  //Imvert the amplitude of the original signal
  let negativeCicle = signal.map((sample) => {
    return sample * (-1)
  })

  //Count how many samples are in one semi cicle os the signal (180 degrees)
  for (let pos = 0; pos < signal.length; pos++) {
    //Find the begining of positive semi-cicle (transition of zero to positive value)
    if ((signal[pos] == 0) & (signal[pos + 1] > 0)) {
      pos += 1
      //Find the end of positive semi-cicle (transition from positive to zero)
      while ((signal[pos] > 0) & (signal[pos + 1] > 0)) {
        if (sampleCount == signal.length) {
          //In case of infinite loop, stop the loop
          break
        }
        pos += 1
        sampleCount += 1
      }
      break;
    }
  }

  negativeCicle.splice(0, -sampleCount);

  for (let i = 0; i < sampleCount+2; i++) {
    negativeCicle.unshift(0);
  }

  return(negativeCicle)
}

// Object for keep the data se the response from the API
const signal = {
  "signal": [],
  "peak": [],
  "zerocross": [],
  "time": [],
}

// Object for store the data from the reconstructed orignal power grid signal 
const reconstructedSignal = {
  "positiveCicle": [],
  "negativeCicle": [],
}

//Selection of charts present in DOM
const charts = document.querySelectorAll("canvas")

// Inserting data into the object to test
signal['zerocross'] = Array(250).fill(0);
signal['signal'] = Array(250).fill(0);
signal['tempo'] = Array(250).fill(0);
signal['peak'] =  Array(250).fill(0);


//charts formating options
const options = {
    responsive: true,
    scales: {
      x: {
        title:{
          display:true,
          text:'Tempo(s)',
          color:'white'
        },
        ticks:{
          color:'white'
        }
      },
      y:{
        title:{
          display:true,
          text:'Tensão (V)',
          color: 'white'
        },
        ticks:{
          color:'white'
        }
      }
    }
  }

// Chart of the signal received from the API (signal sent by the electronic board)
let chart1 = new Chart(charts[0].getContext('2d'), {
  type: 'line',
  data: {
    labels: signal['tempo'],
    datasets: [{
      label: 'Sinal',
      data: signal['signal'],
      color: 'rgb(255,255,255)',
      backgroundColor: 'rgba(58, 178, 223,0.18)',
      borderColor: 'rgba(58, 178, 223,0.9)',
      pointRadius: 0,
      tension: 0.3,
      fill: true,
      borderWidth: 1.5
    },
    {
      label: 'Pico',
      data: signal['peak'],
      color: 'white',
      backgroundColor: 'rgba(182, 116, 246,0.06)',
      borderColor: 'rgba(182, 116, 246,0.9)',
      pointRadius: 0,
      tension: 1,
      fill: true,
      borderWidth: 1.5
    },
    {
      label: 'Passagem por zero',
      data: signal['zerocross'],
      color: 'rgb(255,255,255)',
      backgroundColor: 'rgba(51, 214, 89,0.18)',
      borderColor: 'rgba(51, 214, 89,0.9)',
      pointRadius: 0,
      tension: 0.4,
      fill: true,
      borderWidth: 1.5

    }],
  },
  options:options
});

let newsignal = recreateSignal(signal['signal'])

// Chart of the signal received from the API (signal sent by the electronic board)
let chart2 = new Chart(charts[1].getContext('2d'), {
  type: 'line',
  data: {
    labels: signal['tempo'],
    datasets: [{
      label: 'Semi Ciclo Positivo',
      data: signal['signal'],//reconstructedSignal["positiveCicle"],
      color: 'rgb(255,255,255)',
      backgroundColor: 'rgba(58, 178, 223,0.10)',
      borderColor: 'rgba(58, 178, 223,0.9)',
      pointRadius: 0,
      tension: 0.2,
      fill: true,
      borderWidth: 1.5
    },
    {
      label: 'Semi Ciclo Negativo',
      data: newsignal,//reconstructedSignal["negativeCicle"],
      color: 'rgb(255,255,255)',
      backgroundColor: 'rgba(182, 116, 246,0.10)',
      borderColor: 'rgba(182, 116, 246,0.9)',
      pointRadius: 0,
      tension: 0.2,
      fill: true,
      borderWidth: 1.5
    }],
  },
  options:options
});

/*Signal:[0.04, 0.317, 0.635, 0.754, 0.992, 1.151, 1.429, 1.706, 2.063, 2.341, 2.579, 2.738, 2.897, 2.976, 3.095, 3.095, 3.175, 3.095, 3.214, 3.135, 3.135, 3.055, 2.976, 2.778, 2.659, 2.381, 2.103, 1.706, 1.389, 0.952, 0.635, 0.278, 0.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.159, 0.476, 0.675, 0.913, 1.111, 1.389, 1.667, 2.024, 2.302, 2.54, 2.659, 2.897, 2.936, 3.055, 3.055, 3.095, 3.055, 3.135, 3.095, 3.095, 3.016, 2.936, 2.738, 2.619, 2.341, 2.063, 1.667, 1.349, 0.952, 0.635, 0.238, 0.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.278, 0.556, 0.714, 0.952, 1.111, 1.389, 1.627, 1.984, 2.262, 2.579, 2.698, 2.897, 2.936, 3.095, 3.095, 3.175, 3.095, 3.175, 3.135, 3.175, 3.055, 3.016, 2.857, 2.698, 2.421, 2.182, 1.746, 1.468, 1.032, 0.714, 0.317, 0.079, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.079, 0.436, 0.635, 0.873, 1.071, 1.349, 1.587, 1.944, 2.222, 2.5, 2.619, 2.857, 2.897, 3.016, 3.055, 3.135, 3.055, 3.135, 3.095, 3.095, 3.016, 2.976, 2.778, 2.659, 2.381, 2.143, 1.706, 1.429, 0.992, 0.675, 0.317, 0.04, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

Peak:[3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214, 3.214]

Zero Cross:[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164, 3.164]

Tempo:[0.0, 0.0003, 0.0005, 0.0008, 0.001, 0.0013, 0.0016, 0.0018, 0.0021, 0.0023, 0.0026, 0.0029, 0.0031, 0.0034, 0.0036, 0.0039, 0.0042, 0.0044, 0.0047, 0.0049, 0.0052, 0.0055, 0.0057, 0.006, 0.0062, 0.0065, 0.0068, 0.007, 0.0073, 0.0076, 0.0078, 0.0081, 0.0083, 0.0086, 0.0089, 0.0091, 0.0094, 0.0096, 0.0099, 0.0102, 0.0104, 0.0107, 0.0109, 0.0112, 0.0115, 0.0117, 0.012, 0.0122, 0.0125, 0.0128, 0.013, 0.0133, 0.0135, 0.0138, 0.0141, 0.0143, 0.0146, 0.0148, 0.0151, 0.0154, 0.0156, 0.0159, 0.0161, 0.0164, 0.0167, 0.0169, 0.0172, 0.0174, 0.0177, 0.018, 0.0182, 0.0185, 0.0187, 0.019, 0.0193, 0.0195, 0.0198, 0.0201, 0.0203, 0.0206, 0.0208, 0.0211, 0.0214, 0.0216, 0.0219, 0.0221, 0.0224, 0.0227, 0.0229, 0.0232, 0.0234, 0.0237, 0.024, 0.0242, 0.0245, 0.0247, 0.025, 0.0253, 0.0255, 0.0258, 0.026, 0.0263, 0.0266, 0.0268, 0.0271, 0.0273, 0.0276, 0.0279, 0.0281, 0.0284, 0.0286, 0.0289, 0.0292, 0.0294, 0.0297, 0.0299, 0.0302, 0.0305, 0.0307, 0.031, 0.0312, 0.0315, 0.0318, 0.032, 0.0323, 0.0325, 0.0328, 0.0331, 0.0333, 0.0336, 0.0339, 0.0341, 0.0344, 0.0346, 0.0349, 0.0352, 0.0354, 0.0357, 0.0359, 0.0362, 0.0365, 0.0367, 0.037, 0.0372, 0.0375, 0.0378, 0.038, 0.0383, 0.0385, 0.0388, 0.0391, 0.0393, 0.0396, 0.0398, 0.0401, 0.0404, 0.0406, 0.0409, 0.0411, 0.0414, 0.0417, 0.0419, 0.0422, 0.0424, 0.0427, 0.043, 0.0432, 0.0435, 0.0437, 0.044, 0.0443, 0.0445, 0.0448, 0.045, 0.0453, 0.0456, 0.0458, 0.0461, 0.0464, 0.0466, 0.0469, 0.0471, 0.0474, 0.0477, 0.0479, 0.0482, 0.0484, 0.0487, 0.049, 0.0492, 0.0495, 0.0497, 0.05, 0.0503, 0.0505, 0.0508, 0.051, 0.0513, 0.0516, 0.0518, 0.0521, 0.0523, 0.0526, 0.0529, 0.0531, 0.0534, 0.0536, 0.0539, 0.0542, 0.0544, 0.0547, 0.0549, 0.0552, 0.0555, 0.0557, 0.056, 0.0562, 0.0565, 0.0568, 0.057, 0.0573, 0.0575, 0.0578, 0.0581, 0.0583, 0.0586, 0.0589, 0.0591, 0.0594, 0.0596, 0.0599, 0.0602, 0.0604, 0.0607, 0.0609, 0.0612, 0.0615, 0.0617, 0.062, 0.0622, 0.0625, 0.0628, 0.063, 0.0633, 0.0635, 0.0638, 0.0641, 0.0643, 0.0646, 0.0648, 0.0651, 0.0654, 0.0656, 0.0659, 0.0661, 0.0664, 0.0667]*/