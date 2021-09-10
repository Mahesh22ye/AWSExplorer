// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
const request = require('request')
let response;
console.log('Loading Lambda function.')
/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = (event, context, lcallback) => {
    try {
        // const ret = await axios(url);

//To-Do


const geocode = (address, callback) => {
    const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + encodeURIComponent(address) + '.json?access_token=pk.eyJ1IjoibWFoZXNoMjJ5ZSIsImEiOiJja3N3NTZ4aHIwcnBsMnJwbGJoNTZ2b3ZhIn0.jZrR-2_DHFEwEd1BOq-Djg&limit=1'


    request({ url, json: true }, (error, {body}) => {
        
        if (error) {
            
            callback('Unable to connect to geocoding service', undefined)
        } else if (body.features.length === 0) {
            
            callback('Unable to find location. Try another search.', undefined)
        } else {
            
            const lattitude = body.features[0].center[0]
            const longitude = body.features[0].center[1]
            const placeName = body.features[0].place_name
            const data = {
                lattitude,
                longitude,
                placeName
            }
            callback(undefined, data)
        }

    })
    
  

}

const forecast = (lattitude,longitude,callback) => {
    const url = 'http://api.weatherstack.com/current?access_key=10f71ba3048db6b3675380198a8d5ffd&query=' + lattitude + ',' + longitude

    request({ url, json: true }, (error, { body }) => {
        if (error) {
            callback('Unable to connect to weather service!', undefined)
        } else if (body.success === false) {
            callback('Unable to find weather for requested coordinates', undefined)
        } else {
            const temp = body.current.temperature
            const feelsLike = body.current.feelslike   
            const description = body.current.weather_descriptions[0]
            const humidity = body.current.humidity
            const windspeed = body.current.wind_speed
            const data = description + '. It is ' + temp 
                                    + ' degrees out. It feels like ' 
                                    + feelsLike + ' degrees. The humidity is ' 
                                    + humidity
                                    + "%. Wind speed is " + windspeed
            
            callback(undefined, data)
        }

    })

}


geocode( event.queryStringParameters.address, (error, { lattitude, longitude, placeName } = {}) => {

    if (error) {
   
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'Error',
            })
        }
        lcallback(response, undefined)
    }
    forecast(longitude, lattitude, (error, forecastData) => {
       
        if (error) {
            response = {
                'statusCode': 200,
                'body': JSON.stringify({
                    message: 'Error',
                })
        }
            lcallback(response, undefined)
            
        }

        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                address: event.queryStringParameters.address,
                location: placeName,
                forecast: forecastData
            })
        }
       lcallback(undefined,response)
     
    })


})

//



    } catch (err) {
        console.log(err);
        return err;
    }

if (response === undefined){
    console.log('response is undefined') 
    response = {
                'statusCode': 200,
                'body': JSON.stringify({
                    message: 'Response not set!',
                })
        }
    
}

// console.log('returning response') 
    //  return response
};

