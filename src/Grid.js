import React, { useState, useEffect } from 'react';
import { Button, Space, Form, Slider, Row, Col, Divider, Card, InputNumber, List, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CloseSquareOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';


export default function Grid({ gridType, grid, position, orders, fixedLen}) {
    const [topPrice, setTopPrice] = useState(0);
    const [buyPrice, setBuyPrice] = useState(0);
    const [closePrice, setClosePrice] = useState(0);
    const [totalSize, setTotalSize] = useState(0);
    const [gridNum, setGridNum] = useState(0);
    const [priceRate, setPriceRate] = useState(0);
    const [marks, setMarks] = useState({});

    const navigate = useNavigate();

    useEffect(() => {
        if (grid && fixedLen != 'NaN') {
            setTopPrice(grid.topPrice);
            setBuyPrice(grid.buyPrice);
            setClosePrice(grid.closePrice);
            setTotalSize(grid.totalSize);
            setGridNum(grid.gridNum);
            setPriceRate(((Number(grid.topPrice) - Number(grid.buyPrice)) / grid.gridNum / Number(grid.buyPrice)  * 100).toFixed())

            const marks = {};
            const values = [0];
            if (grid) {
                const span = 80 / grid.gridNum;
                const spanPrice = (grid.topPrice - grid.buyPrice) / grid.gridNum;
                for (var i = 0; i <= grid.gridNum; i++) {
                    marks[span * i] = {
                        style: {
                            // color: '#f50',

                        },
                        label: parseFloat((grid.topPrice - spanPrice * i).toFixed(fixedLen))
                    };
                }
                marks[100] = {
                    style: {
                        color: '#f50',
                    },
                    label: <strong>{grid.closePrice}</strong>,
                };
                values[1] = 10;
                setMarks(marks);
            }
        }
    }, [grid, fixedLen]);

    return (
        <Card
            // headStyle={{ backgroundColor: gridType == 'long' ? "red" : "green" }}
            title={
                <Row style={{}}>
                    <Col span={2} style={{ color: gridType == 'long' ? "red" : "green" }} >
                        {gridType == 'long' ? "开多" : "开空"}
                    </Col>
                    <Col span={4}>
                        &nbsp;{grid?.status && grid?.status.slice(0, 1)}
                    </Col>
                    <Col span={18}>
                        <Space size={8} style={{ float: 'right' }}>
                            <Button disabled={!grid || !grid.id} type="primary" onClick={() => {
                                grid.topPrice = topPrice;
                                grid.buyPrice = buyPrice;
                                grid.closePrice = closePrice;
                                grid.gridNum = gridNum;
                                grid.totalSize = totalSize;
                                if(grid.status == "STOPED") {
                                    grid.status = 'COMPLETED';
                                } else {
                                    grid.status = "STOPED";
                                }
                                axios.post(`${process.env.REACT_APP_BASE_PATH}/futures/saveGrid`, grid, {
                                    headers: { sessionID: localStorage.getItem("sessionID") }
                                }).then(function (response) {
                                    console.log(response);
                                    message.info("SUCCESS");
                                    if (!grid.id) {
                                        navigate(`/${grid.contract.split('_')[0]}`);
                                        window.location.reload();
                                    }
                                }).catch(function (error) {
                                    message.error(error);
                                    console.log(error);
                                });
                            }}>{(grid?.status == 'STOPED')?'开始':'停止'}</Button>

                            <Button type="primary" onClick={() => {
                                grid.topPrice = topPrice;
                                grid.buyPrice = buyPrice;
                                grid.closePrice = closePrice;
                                grid.gridNum = gridNum;
                                grid.totalSize = totalSize;
                               
                                axios.post(`${process.env.REACT_APP_BASE_PATH}/futures/saveGrid`, grid, {
                                    headers: { sessionID: localStorage.getItem("sessionID") }
                                }).then(function (response) {
                                    console.log(response);
                                    message.info("SUCCESS");
                                    if (!grid.id) {
                                        navigate(`/${grid.contract.split('_')[0]}`);
                                        window.location.reload();
                                    }
                                }).catch(function (error) {
                                    console.log(error);
                                    message.error(error);
                                });
                            }}>保存</Button>
                        </Space>
                    </Col>
                </Row>
            } size="small">
            <div>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            label="top price"
                            // style={{ width: '30%' }}
                            rules={[{ required: true, message: 'Please input your buy price!' }]}
                        >
                            <InputNumber style={{ width: '100%' }} value={topPrice} step="0.05" onChange={(value) => {
                                setTopPrice(value);
                            }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="buy price"
                            // style={{ width: '30%' }}
                            rules={[{ required: true, message: 'Please input your buy price!' }]}
                        >
                            <InputNumber style={{ width: '100%' }} value={buyPrice} step="0.05" onChange={(value) => {
                                setBuyPrice(value);
                            }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="close price"
                            rules={[{ required: true, message: 'Please input your close price!' }]}
                        >
                            <InputNumber style={{ width: '100% ' }} value={closePrice} step="0.05" onChange={(value) => {
                                setClosePrice(value);
                            }} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row align='middle' gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            label="size"
                            rules={[{ required: true, message: 'Please input your size!' }]}
                        >
                            <InputNumber style={{ width: '100%' }} value={totalSize} onChange={(value) => {
                                setTotalSize(value);
                            }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="grid num"
                            rules={[{ required: true, message: 'Please input your grid num!' }]}
                        >
                            <InputNumber style={{ width: '100%' }} value={gridNum} onChange={(value) => {
                                setGridNum(value)
                            }} />
                        </Form.Item>
                    </Col>
                    <Col span={8} style={{ textAlign: 'right' }} >
                        <Form.Item
                            label="grid price rate"
                            rules={[{ required: true, message: 'Please input your grid num!' }]}
                        >
                            <InputNumber style={{ width: '100%' }} defaultValue={priceRate} onChange={(value) => {
                                // setTopPrice(buyPrice + parseFloat());
                                const _buyPrice = Number(buyPrice);
                                const _closePrice = parseFloat((_buyPrice - _buyPrice * Number(value) / 100).toFixed(fixedLen));
                                const _topPrice =  parseFloat((_buyPrice + _buyPrice * gridNum * Number(value) / 100).toFixed(fixedLen));
        
                                setTopPrice(_topPrice);
                                setClosePrice(_closePrice);
                            }} />
                        </Form.Item>
                    </Col>
                </Row>
                <Divider />
                <div>
                    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                        <div style={{ textAlign: 'right' }}>
                            <Button disabled={position?.size == 0} type="primary" onClick={() => {
                                axios.post(`${process.env.REACT_APP_BASE_PATH}/futures/closing/${grid.contract}?autoSize=${gridType == 'long' ? 0 : 1}`, null, {
                                    headers: { sessionID: localStorage.getItem("sessionID") }
                                }).then(function (response) {
                                    console.log(response);
                                    message.info("SUCCESS");
                                }).catch(function (error) {
                                    console.log(error);
                                });

                            }}>平仓</Button>
                        </div>
                        <div>
                            <span>仓位:</span><span> {position?.size}</span>
                            {
                                grid?.totalSize != 0 && <Slider range marks={marks} value={[0, position?.size * 80 / grid?.totalSize]} />
                            }

                        </div>

                        <List
                            dataSource={orders ? orders : []}
                            renderItem={(item) => (
                                <List.Item>
                                    <Card title={<div>
                                        <div>ID {item.id}</div>
                                        <div style={{ fontSize: 12, fontWeight: 200 }}>{moment.unix(item.createTime).format().slice(0, 19)}</div>

                                    </div>} extra={<a onClick={() => {
                                        message.warning({
                                            content: "确定",
                                            duration: 3,
                                            onClick: () => {
                                                message.destroy();
                                                axios.post(`${process.env.REACT_APP_BASE_PATH}/futures/cancelOrder/${item.id}`, null, {
                                                    headers: { sessionID: localStorage.getItem("sessionID") }
                                                }).then(function (response) {
                                                    message.info("SUCCESS");
                                                    navigate(`/${grid.contract.split('_')[0]}`);
                                                    window.location.reload();
                                                }).catch(function (error) {
                                                    console.log(error);
                                                });
                                            }
                                        })
                                    }}><CloseSquareOutlined /></a>} style={{ width: '100%' }}
                                    bodyStyle={{padding:12}}>
                                        <Row>
                                            <Col span={10}>
                                                <div>价格: {item.price}</div>
                                            </Col>
                                            <Col span={7}>
                                                <div>数量: {item.size}</div>
                                            </Col>
                                            <Col span={7}>
                                                <div>未成交: {item.left}</div>
                                            </Col>
                                        </Row>
                                    </Card>


                                </List.Item>
                            )}
                        />
                    </Space>
                </div>
            </div>
        </Card>
    );
}