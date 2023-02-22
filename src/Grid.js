import React, { useState, useEffect } from 'react';
import { Button, Space, Form, Input, Row, Col, Divider, Card, InputNumber, List, message } from 'antd';
import axios from 'axios';
import cookie from 'react-cookies';
import moment from 'moment';

export default function Grid({ gridType, grid, position, orders }) {
    const [topPrice, setTopPrice] = useState(0);
    const [buyPrice, setBuyPrice] = useState(0);
    const [closePrice, setClosePrice] = useState(0);
    const [totalSize, setTotalSize] = useState(0);
    const [gridNum, setGridNum] = useState(0);


    useEffect(() => {
        if (grid) {
            setTopPrice(grid.topPrice);
            setBuyPrice(grid.buyPrice);
            setClosePrice(grid.closePrice);
            setTotalSize(grid.totalSize);
            setGridNum(grid.gridNum);
        }
    }, [grid]);

    return (
        <Card
            // headStyle={{ backgroundColor: gridType == 'long' ? "red" : "green" }}
            title={
                <Row style={{}}>
                    <Col span={2} style={{ color: gridType == 'long' ? "red" : "green" }} >
                        {gridType == 'long' ? "开多" : "开空"}
                    </Col>
                    <Col span={4}>
                        {grid?.status}
                    </Col>
                    <Col span={18}>
                        <Space size={8} style={{float:'right'}}>
                            <Button disabled={!grid||grid?.status=='STOPED'}  type="primary" onClick={() => {
                                grid.topPrice = topPrice;
                                grid.buyPrice = buyPrice;
                                grid.closePrice = closePrice;
                                grid.gridNum = gridNum;
                                grid.totalSize = totalSize;
                                grid.status = "STOPED";
                                axios.post(`${process.env.REACT_APP_BASE_PATH}/futures/saveGrid`, grid, {
                                    headers: { sessionID: cookie.load("sessionID") }
                                }).then(function (response) {
                                    console.log(response);
                                    message.info("SUCCESS");
                                }).catch(function (error) {
                                    console.log(error);
                                });
                            }}>停止</Button>

                            <Button type="primary" onClick={() => {
                                grid.topPrice = topPrice;
                                grid.buyPrice = buyPrice;
                                grid.closePrice = closePrice;
                                grid.gridNum = gridNum;
                                grid.totalSize = totalSize;
                                grid.status = 'COMPLETED';
                                axios.post(`${process.env.REACT_APP_BASE_PATH}/futures/saveGrid`, grid, {
                                    headers: { sessionID: cookie.load("sessionID") }
                                }).then(function (response) {
                                    console.log(response);
                                    message.info("SUCCESS");
                                }).catch(function (error) {
                                    console.log(error);
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
                        <Form.Item>
                            <div>

                            </div>
                        </Form.Item>

                    </Col>
                </Row>
                <Divider />
                <div>
                    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                        <Row>
                            <Col span={8}><span >合约仓位:</span><span> {position?.size}</span>
                            </Col>
                            <Col span={8}>
                            </Col>
                            <Col span={8}>
                                <Button disabled={position?.size == 0} type="primary" onClick={() => {
                                    axios.post(`${process.env.REACT_APP_BASE_PATH}/futures/closing/${grid.contract}?autoSize=0`, null, {
                                        headers: { sessionID: cookie.load("sessionID") }
                                    }).then(function (response) {
                                        console.log(response);
                                        message.info("SUCCESS");
                                    }).catch(function (error) {
                                        console.log(error);
                                    });

                                }}>平仓</Button>
                            </Col>
                        </Row>

                        <List
                            header={<div>
                                <Row>
                                    <Col span={6}><span>订单 ID</span>
                                    </Col>
                                    <Col span={4}><span>价格</span>
                                    </Col>
                                    <Col span={4}>
                                        <span>交易数量</span>
                                    </Col>
                                    <Col span={4}>
                                        <span>未成交数量</span>
                                    </Col>
                                    <Col span={6}>
                                        <span>订单创建时间</span>
                                    </Col>

                                </Row>
                            </div>}
                            bordered
                            dataSource={orders ? orders : []}
                            renderItem={(item) => (
                                <List.Item>
                                    <Row gutter={[16, 16]} style={{ width: '100%' }}>
                                        <Col span={6}>
                                            <div>{item.id}</div>
                                        </Col>
                                        <Col span={4}>
                                            <div>{item.price}</div>
                                        </Col>
                                        <Col span={4}>
                                            <div>{item.size}</div>
                                        </Col>
                                        <Col span={4}>
                                            <div>{item.left}</div>
                                        </Col>
                                        <Col span={6}>
                                            <div>{moment.unix(item.createTime).format().slice(0, 19)}</div>
                                        </Col>
                                    </Row>
                                </List.Item>
                            )}
                        />

                    </Space>

                </div>
            </div>
        </Card>
    );
}