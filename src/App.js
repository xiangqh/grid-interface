import React, { useState, useEffect } from 'react';
import { Button, Space, Form, Input, Row, Col, Divider, Card, Breadcrumb } from 'antd';
import { BrowserRouter, HashRouter, Routes, Router, Route, useParams } from 'react-router-dom'
import axios from 'axios';
import cookie from 'react-cookies';
import Grid from './Grid.js';
import Login from './Login.js';

axios.defaults.withCredentials = true;

function App() {
  return (
    <div className="App">
        <BrowserRouter>
          <Routes>
            <Route index path="/" element={<Home />} />
            <Route path="/:token" element={<Home />} />
          </Routes>
        </BrowserRouter>
    </div>
  )
}

export default App

function Home() {
  const params = useParams();
  const [contract, setContract] = useState(null);
  const [long, setLong] = useState(null);
  const [short, setShort] = useState(null);

  const [longGrid, setLongGrid] = useState(null);
  const [shortGrid, setShortGrid] = useState(null);

  const [longOrders, setLongOrders] = useState(null);
  const [shortOrders, setShortOrders] = useState(null);

  const [session, setSession] = useState(cookie.load("sessionID"));

  const contractName = params.token? `${params.token}_USDT`:"BTC_USDT";
  
  const fetchDate = (path, contract, callback) => {
    axios.get(`${process.env.REACT_APP_BASE_PATH}/futures/${path}/` + contractName, {
      headers: { sessionID: session }
    }).then(function (response) {
      callback(response);
    }).catch(function (error) {
      if (error.response && error.response.status == 403) {
        cookie.remove("sessionID");
        setSession(null);
      }
    });
  }

  const init = () => {
    fetchDate("getContract", contractName, function (response) {
      setContract(response.data);
    });

    const sessionID = cookie.load("sessionID");
    if (sessionID) {
      fetchDate("openOrders", contractName, function (response) {
        let _longOrders = [];
        let _shortOrders = [];
        // if (response.data.is)
        response.data.forEach(each => {
          if (each.isReduceOnly == false) {
            if (each.size > 0) {
              _longOrders.push(each);
            } else {
              _shortOrders.push(each);
            }
          } else {
            if (each.size > 0) {
              _shortOrders.push(each);
            } else {
              _longOrders.push(each);
            }
          }
        });
        setLongOrders(_longOrders);
        setShortOrders(_shortOrders);
      });


      fetchDate("getPositions", contractName, function (response) {
        if (response.data[0].mode == "dual_long") {
          setLong(response.data[0]);
          setShort(response.data[1]);
        } else {
          setLong(response.data[1]);
          setShort(response.data[0]);
        }
      });


    }
  }
  useEffect(() => {
    init();
    fetchDate("grids", contractName, function (response) {
      if (response.data.length > 0) {
        if (response.data[0].topPrice > response.data[0].buyPrice) {
          setLongGrid(response.data[0]);
        } else {
          setShortGrid(response.data[0]);
        }
        if (response.data.length > 1) {
          if (response.data[1].topPrice > response.data[1].buyPrice) {
            setLongGrid(response.data[0]);
          } else {
            setShortGrid(response.data[0]);
          }
        }
      } else {
        setLongGrid({
          contract: contractName,
          topPrice: 0,
          buyPrice: 0,
          closePrice: 0,
          priceRound: 0,
          totalSize: 0,
          gridNum: 0,
        });
        setShortGrid({
          contract: contractName,
          topPrice: 0,
          buyPrice: 0,
          closePrice: 0,
          priceRound: 0,
          totalSize: 0,
          gridNum: 0,
        });
      }
    });

    const timer = setInterval(() => {
      init();
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, []);


  return (
    <div style={{ marginTop: 20 }}>
      <Breadcrumb style={{ float: 'right', marginRight: 100 }}>
        <Breadcrumb.Item onClick={() => {
          axios.post(`${process.env.REACT_APP_BASE_PATH}/futures/logout`, {
            headers: { sessionID: session }
          }).then(function (response) {
            if (response.data.code == 200) {
              cookie.remove("sessionID");
              setSession(null);
            }
          }).catch(function (error) {

          });
        }}>Logout</Breadcrumb.Item>

      </Breadcrumb>
      <Divider />
      {
        session ?
          <Space direction="vertical" size="middle" style={{ display: 'flex', marginInline: 20, }}>
            <Row style={{ marginInline: 20, }}>
              <Col span={8}>
                <div>合约</div>
                <div>{contract?.name}</div>
              </Col>
              <Col span={8}>
                <div>指数价格</div>
                <div>{contract?.indexPrice}</div>
              </Col>
              <Col span={8}>
                <div>委托价格最小单位</div>
                <div>{contract?.orderPriceRound}</div>
              </Col>
            </Row>
            <div>
              <Grid gridType="long" grid={longGrid} position={long} orders={longOrders} />
              {/* <Grid gridType="short" grid={shortGrid} position={short} orders={shortOrders} /> */}
            </div>
          </Space> : <Login />
      }
    </div>
  );
}


