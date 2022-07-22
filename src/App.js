import './App.scss';
import axios from 'axios';
import { useEffect, useState } from 'react';

function App() {
  const [ApiData, setApiData] = useState([])
  const [markPrice, setmarkPrice] = useState({})
  let temp_mark_price = {}

  const ws = new WebSocket('wss://production-esocket.delta.exchange');

  useEffect(() => {
    async function fetchData() {
      let symbolList = []
      await axios.get('https://api.delta.exchange/v2/products')
        .then((response) => {
          symbolList.push(
            response.data.result.map((item) => {
              return item.symbol
            })
          )
          setApiData(response.data.result)
        })

      let subscription = {
        type: "subscribe",
        payload: {
          channels: [
            {
              name: "v2/ticker",
              symbols: symbolList[0]
            }
          ]
        }
      }

      ws.onopen = await function (event) {
        ws.send(JSON.stringify(subscription));
        if (ws.readyState === 1 && symbolList[0] !== [])
          console.log("Socket Opened");
        else
          console.log("Closed");
      };

      ws.onmessage = await function (event) {
        const json = JSON.parse(event.data);
        temp_mark_price[json.symbol] = json.mark_price;
        setmarkPrice(temp_mark_price)
      };

    }
    fetchData()
  }, [ApiData])

  return (
    <div className='App'>
      <table className='Table'>
        <thead>
          <tr>
            <td>Symbol</td> <td>Description</td> <td>Underlying Assest</td>
            <td>Mark Price</td>
          </tr>
        </thead>
        {
          ApiData.map((item) => {
            return (
              <tr>
                <td>{item.symbol}</td> <td>{item.description}</td> <td>{item.underlying_asset.symbol}</td>
                <td>{markPrice[item.symbol]}</td>
              </tr>
            )
          })
        }
      </table>
    </div>
  );
}

export default App;
