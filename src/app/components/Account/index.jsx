import React, { useState, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";

import { Form, Row, Col, Menu, Dropdown, Button, message } from "antd";

import accountSvc from "../../../common/services/account.svc";
import connectors from "../../../extension/background-script/connectors";
import LndForm from "../Lnd";
import CLightningForm from "../CLightning";
import LndHubForm from "../LndHub";
import LnBitsForm from "../LnBits";
import NativeConnectionForm from "../NativeConnection";
import NodeInfo from "../NodeInfo";

const CONNECTORS = {
  lnd: "LND",
  clightning: "C-Lightning",
  lndhub: "LndHub",
  lnbits: "LnBits",
  native: "Native",
};

const Account = () => {
  const history = useHistory();
  const location = useLocation();
  const accountId = location.state && location.state.accountId;
  const [account, setAccount] = useState({});
  const [accountType, setAccountType] = useState("lnd");
  const [nodeInfo, setNodeInfo] = useState(null);
  const [disableTest, setDisableTest] = useState(false);
  const [showNodeInfo, setShowNodeInfo] = useState(false);

  useEffect(() => {
    async function fetchAccount() {
      const acc = (await accountSvc.getById(accountId)) || {};
      setAccount(acc);
      if (acc.type) {
        setAccountType(acc.type);
      }
    }
    fetchAccount();
  }, [accountId]);

  let connectorForm = null;
  const submitHook = (innerForm) => {
    connectorForm = innerForm;
  };

  const handleSubmit = async () => {
    try {
      const values = connectorForm && (await connectorForm.validateFields());
      const newAccount = Object.assign({}, account || {}, values || {});
      newAccount.type = accountType;
      setAccount(newAccount);
      if (newAccount.id) {
        await accountSvc.update(newAccount);
        message.success(`Account ${newAccount.name} updated!`);
      } else {
        await accountSvc.add(newAccount);
        message.success(`Account ${newAccount.name} created!`);
      }
      history.goBack();
    } catch (err) {
      message.error("Please check field values!");
    }
  };

  const handleConnectorTypeChange = (type) => {
    setAccountType(type);
  };

  const handleTestAccount = async () => {
    try {
      setDisableTest(true);
      setNodeInfo(null);
      const values = connectorForm && (await connectorForm.validateFields());
      const connectorType = account && account.type;
      if (!connectorType || !CONNECTORS[connectorType]) {
        message.error(`Unknown connector: '${connectorType}'!`);
        return;
      }
      message.info(`Trying to connect to ${values.name}`);

      const testConnector = connectors[connectorType];
      const con = new testConnector(values);
      const info = await con.getInfo();

      setNodeInfo(info);
      message.success(`Connected. Node alias: ${info.data.alias || ""}`);
    } catch (err) {
      console.error(err);
      message.error(`Cannot connect ${err.message || ""}`);
    }
    setTimeout(() => {
      setDisableTest(false);
    }, 200);
  };

  const menu = (
    <Menu>
      {Object.keys(CONNECTORS).map((key) => (
        <Menu.Item key={key} onClick={() => handleConnectorTypeChange(key)}>
          {CONNECTORS[key]}
        </Menu.Item>
      ))}
    </Menu>
  );

  const accountConfig = () => {
    if (accountType === "lnd") {
      return <LndForm initialValues={account} submitHook={submitHook} />;
    }
    if (accountType === "clightning") {
      return <CLightningForm initialValues={account} submitHook={submitHook} />;
    }
    if (accountType === "lndhub") {
      return <LndHubForm initialValues={account} submitHook={submitHook} />;
    }
    if (accountType === "lnbits") {
      return <LnBitsForm initialValues={account} submitHook={submitHook} />;
    }
    if (accountType === "native") {
      return (
        <NativeConnectionForm initialValues={account} submitHook={submitHook} />
      );
    }
    return <div>Unknown Account Type</div>;
  };

  return (
    <>
      {!showNodeInfo ? (
        <div>
          <Row>
            <Col span={1}></Col>
            <Col span={20}>
              <Form name="basic" layout="vertical">
                <Form.Item label="Type" name="type">
                  <Dropdown.Button
                    overlay={menu}
                    disabled={account && account.id}
                  >
                    {CONNECTORS[accountType]}
                  </Dropdown.Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
          <Row>
            <Col span={1}></Col>
            <Col span={23}> {accountConfig()} </Col>
          </Row>
          <Row>
            <Col span={1}></Col>
            <Col span={5}>
              {account && account.id ? (
                <Button type="primary" onClick={handleSubmit}>
                  Update
                </Button>
              ) : (
                <Button type="primary" onClick={handleSubmit}>
                  Add
                </Button>
              )}
            </Col>
            <Col span={5}>
              <Button
                type="danger"
                onClick={handleTestAccount}
                loading={disableTest}
                size="middle"
              >
                Test
              </Button>
            </Col>
            <Col span={5}>
              {nodeInfo ? (
                <Button onClick={() => setShowNodeInfo(true)}>
                  Node Details
                </Button>
              ) : (
                <div></div>
              )}
            </Col>
            <Col span={5}>
              <Button type="text" onClick={history.goBack}>
                Cancel
              </Button>
            </Col>
          </Row>
        </div>
      ) : (
        <div>
          <Row>
            <Col span={1}>&nbsp;</Col>
          </Row>
          <Row>
            <Col span={1}></Col>
            <Col span={23}>
              <Button onClick={() => setShowNodeInfo(false)}>Back</Button>
            </Col>
          </Row>
          <Row>
            <Col span={1}>&nbsp;</Col>
          </Row>
          <Row>
            <Col span={1}></Col>
            <Col span={22}>
              <NodeInfo initialValues={nodeInfo} />
            </Col>
            <Col span={1}></Col>
          </Row>
        </div>
      )}
    </>
  );
};

export default Account;
