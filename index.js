const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config()
const token = process.env.TOKEN
const weatherApiKey = '9d441a67b43dc13bf96da97121d76abe';

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'privet');
});
let placeName

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  placeName = msg.text.trim();
  if (msg.text !== '/start') {
    bot.sendMessage(chatId, "meky yntri ", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "country", callback_data: "country" },
          { text: "continent", callback_data: "continent" }],
          [{ text: "city", callback_data: "city" }],
          [{ text: "planet", callback_data: "planet" }],
          [{ text: "weather", callback_data: "weather" }]
        ]
      }
    })
  }
})


bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const choice = query.data;

  if (choice === 'country') {
    try {
      bot.sendMessage(chatId, 'country.');
      const countryResponse = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(placeName.replace(/\s+/g, ''))}`);

      if (countryResponse.data.length > 0) {
        const countryData = countryResponse.data[0];
        const countryInfo = `
Country: ${countryData.name.common}
Capital: ${countryData.capital.join(', ')}
Region: ${countryData.region}
Population: ${countryData.population}
Area: ${countryData.area} km²
`;
        bot.sendMessage(chatId, countryInfo);
        return;
      }
    } catch (error) {
      catchError(chatId, error)
    }
  } else if (choice === 'continent') {
    try {
      bot.sendMessage(chatId, 'continent.');
      const continents = {
        africa: {
          info: 'Africa - continent in the Southern Hemisphere of the Earth, third largest after Asia and America.',
          countries: '54 countries'
        },
        antarctica: {
          info: 'Antarctica - continent surrounding the South Pole of the Earth.',
          countries: '0 countries (international zone)'
        },
        asia: {
          info: 'Asia - largest continent located in the Eastern Hemisphere of the Earth.',
          countries: '49 countries'
        },
        europe: {
          info: 'Europe - continent located in the Western Hemisphere of the Earth.',
          countries: '51 countries'
        },
        northamerica: {
          info: 'North America - continent located in the Western Hemisphere of the Earth.',
          countries: '23 countries'
        },
        oceania: {
          info: 'Oceania - group of islands located in the Pacific and Indian Oceans.',
          countries: '14 countries'
        },
        southamerica: {
          info: 'South America - continent located in the Southern Hemisphere of the Earth.',
          countries: '12 countries'
        }
      };

      const continentData = continents[placeName.replace(/\s+/g, '').toLowerCase()];

      if (continentData) {
        const continentInfo = `
Continent: ${placeName}
Description: ${continentData.info}
Countries: ${continentData.countries}
`;
        bot.sendMessage(chatId, continentInfo);
        return;
      }
    } catch (error) {
      catchError(chatId, error)
    }
  } else if (choice === 'city') {
    try {
      bot.sendMessage(chatId, 'city.');
      const cityResponse = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName.replace(/\s+/g, ''))}&format=json&limit=1`);

      if (cityResponse.data.length > 0) {
        const cityData = cityResponse.data[0];
        const cityInfo = `
City: ${cityData.display_name}
Coordinates: ${cityData.lat}, ${cityData.lon}
`;
        bot.sendMessage(chatId, cityInfo);
        return;
      }
    } catch (error) {
      catchError(chatId, error)
    }

  } else if (choice === 'planet') {
    try {
      bot.sendMessage(chatId, 'planet.');
      const planets = {
        mercury: {
          name: 'Mercury',
          info: 'Mercury - closest planet to the Sun in the Solar System, second smallest and fastest orbiting.'
        },
        venus: {
          name: 'Venus',
          info: 'Venus - second planet from the Sun, brightest object in the sky after the Sun and Moon.'
        },
        earth: {
          name: 'Earth',
          info: 'Earth - third planet from the Sun, the only known planet to support life.'
        },
        mars: {
          name: 'Mars',
          info: 'Mars - fourth planet from the Sun, known for its red sand dunes and volcanoes.'
        },
        jupiter: {
          name: 'Jupiter',
          info: 'Jupiter - largest planet in the Solar System, fifth from the Sun.'
        },
        saturn: {
          name: 'Saturn',
          info: 'Saturn - sixth planet from the Sun, known for its rings made of ice and rocks.'
        },
        uranus: {
          name: 'Uranus',
          info: 'Uranus - seventh planet from the Sun, known for its tilted axis and icy rings.'
        },
        neptune: {
          name: 'Neptune',
          info: 'Neptune - eighth and farthest planet from the Sun, known for its strong winds and giant icy moons.'
        }
      };

      const planetData = planets[placeName.replace(/\s+/g, '').toLowerCase()];

      if (planetData) {
        const planetInfo = `
Planet: ${planetData.name}
Description: ${planetData.info}
`;
        bot.sendMessage(chatId, planetInfo);
        return;
      }
    } catch (error) {
      catchError(chatId, error)
    }
  } else if (choice === 'weather') {
    try {
      bot.sendMessage(chatId, 'weather.');
      const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(placeName.replace(/\s+/g, ''))}&appid=${weatherApiKey}&lang=en&units=metric`);

      if (weatherResponse.data) {
        const weatherData = weatherResponse.data;
        const weatherInfo = `
Weather in ${weatherData.name}, ${weatherData.sys.country}:
Temperature: ${weatherData.main.temp}°C
Feels like: ${weatherData.main.feels_like}°C
Humidity: ${weatherData.main.humidity}%
Wind Speed: ${weatherData.wind.speed} m/s
Weather Condition: ${weatherData.weather[0].description}
`;
        bot.sendMessage(chatId, weatherInfo);
        return;
      }

      bot.sendMessage(chatId, 'menq chgtanq informatia');
    } catch (error) {
      catchError(chatId, error)
    }
  }
});


function catchError(chatId, error) {
  console.error('Error:', error);
  if (error.response && error.response.status === 404) {
    bot.sendMessage(chatId, 'dra masin menq informacia chunenq.');
  } else {
    bot.sendMessage(chatId, 'inchpes misht inchvor ban ayn che xndrumenq porcel noric.');
  }
}
