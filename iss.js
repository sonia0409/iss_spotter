const request = require("request");

/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
 //const ip = "apikey=96d2f380-53c1-11ec-8e7b-1bdd30f693cd";
const fetchMyIP = function(callback) {
  
  // use request to fetch IP address from JSON API
  request('https://api.ipify.org/?format=json', (error, response, body) => {
    // inside the request callback ...
    // error can be set if invalid domain, user is offline, etc.
    if (error) {
      callback(error, null);
      return;
    }
    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    // if we get here, all's well and we got the data
    const ip = JSON.parse(body).ip;
    if (!error) {
      callback(null, ip);
    }

  });
};

const fetchCoordsByIP = function(ip, callback) {
  request(`https://freegeoip.app/json/${ip}`, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    let coordinates = {};
    coordinates.longitude = JSON.parse(body).longitude;
    coordinates.latitude = JSON.parse(body).latitude;
    if (!error) {
      callback(null, coordinates);
    }

  });
};


const fetchISSFlyOverTimes = function(coords, callback) {
  const url = `https://iss-pass.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`;

  request(url, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching ISS pass times: ${body}`), null);
      return;
    }

    const passes = JSON.parse(body).response;
    if (!error) {
      callback(null, passes);
    }
  });

};

const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if(error){
      return callback(error,null);
    }
    fetchCoordsByIP(ip,(error, loc) => {
      if(error){
        return callback(error,null);
      }
      fetchISSFlyOverTimes(loc,(error, nextPasses) => {
        if(error){
          return callback(error,null);
        }
        callback(null, nextPasses)

      });
  
    });
  
  });
}

//fetchMyIP ()
module.exports = { nextISSTimesForMyLocation };