const axios = require("axios");
const fs = require("fs");

// Fonction pour récupérer les heures de lever et de coucher du soleil pour une date donnée
async function getSunriseSunset(lat, lng, date, tzid) {
  const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${date}&tzid=${tzid}`;
  try {
    const response = await axios.get(url);
    const { sunrise, sunset } = response.data.results;
    return { sunrise, sunset };
  } catch (error) {
    console.error(error);
    return null;
  }
}

// Fonction pour générer les heures de lever et de coucher du soleil pour chaque jour de l'année
async function generateSunriseSunsetData(lat, lng, tzid) {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const data = {};

  for (let day = 1; day <= 365; day++) {
    const date = new Date(year, 0, day);
    const formattedDate = date.toISOString().slice(0, 10); // Format YYYY-MM-DD
    const { sunrise, sunset } = await getSunriseSunset(
      lat,
      lng,
      formattedDate,
      tzid,
    );
    data[day] = { sunrise, sunset };
    console.log(`Jour ${day} : ${formattedDate}`);
  }

  return data;
}

// Limoges
const latitude = 45.85;
const longitude = 1.25;
const timezone = "Europe/Paris";

// Génération des données et écriture dans un fichier JSON
generateSunriseSunsetData(latitude, longitude, timezone)
  .then((data) => {
    const filename = `sunriseSunsetData${new Date.getFullYear()}.json`;
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log("TERMINÉ");
  })
  .catch((error) => console.error(error));
