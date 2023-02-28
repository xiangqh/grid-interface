import React, { useState, useEffect } from 'react';
import { Button, Space, Form, Input, Row, Col, Divider, Card, Checkbox, message } from 'antd';
import axios from 'axios';
import chacha20 from './Chacha20.js';

export default function Login() {
    const [signup, setSignup] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [key, setKey] = useState("");
    const [secret, setSecret] = useState("");

    const fromHexString = (hexString, length) => {
        return Uint8Array.from(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))
    }

    const toHexString = bytes =>
        bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

    const fromString = (text, length) => {
        let ret = new Uint8Array(length);
        ret.fill(text);
        return ret;
    }

    const stringToHex = str => {
        var val = "";
        for (var i = 0; i < str.length; i++) {
            if (val == "") {
                val = str.charCodeAt(i).toString(16);
            } else {
                val += str.charCodeAt(i).toString(16);
            }
        }
        return val;
    }

    return (
        <div>
            <Form
                name="basic"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                style={{ maxWidth: '100%', paddingInline: 30}}
                initialValues={{ remember: true }}
                autoComplete="off"
            >
                <Form.Item
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                >
                    <Input onChange={(e) => {
                        setUsername(e.target.value);
                    }} />
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password onChange={(e) => {
                        setPassword(e.target.value)
                    }} />
                </Form.Item>


                {signup && <Form.Item
                    label="key"
                    name="key"
                    rules={[{ required: true, message: 'Please input your key!' }]}
                >
                    <Input onChange={(e) => {
                        setKey(e.target.value);
                    }} />
                </Form.Item>
                }

                {
                    signup && <Form.Item
                        label="secret"
                        name="secret"
                        rules={[{ required: true, message: 'Please input your secret!' }]}
                    >
                        <Input onChange={(e) => {
                            setSecret(e.target.value);
                        }} />
                    </Form.Item>
                }

                <Form.Item name="remember" valuePropName="checked" wrapperCol={{ offset: 8, span: 16 }}>
                    <span>
                        <a onClick={() => {
                            setSignup(!signup);
                        }}>
                            {
                                signup ? "Login" : "Singup"
                            }
                        </a>
                    </span>
                </Form.Item>

                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit" onClick={(e) => {
                        if (signup) {
                            const ckey = fromHexString(stringToHex(password), 32);
                            const plaintextKey = fromHexString(key, 16);
                            const plaintextSecret = fromHexString(secret, 32);

                            const _key = toHexString(chacha20(plaintextKey, ckey));
                            const _secret = toHexString(chacha20(plaintextSecret, ckey));

                            axios.post(`${process.env.REACT_APP_BASE_PATH}/accounts/signup`, {
                                username: username,
                                password: password,
                                key: _key,
                                secret: _secret
                            }).then(response => {
                                if (response.data.code = 200) {
                                    message.info("SUCCESS");
                                    setSignup(false);
                                } else {
                                    message.error(response.data.error, [3])
                                }
                            }).catch(err => {
                                console.log(err);
                                message.error(err.message, [3])
                            })

                        } else {
                            axios.post(`${process.env.REACT_APP_BASE_PATH}/accounts/login`, {
                                username: username,
                                password: password,
                            }).then(response => {
                                if (response.data.ret) {
                                    localStorage.setItem("sessionID", response.data.ret);
                                    window.location.reload();
                                } else {
                                    message.error(response.data.error, [3])
                                }
                            }).catch(err => {
                                console.log(err);
                                message.error(err.message, [3])
                            })
                        }
                    }}>
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}