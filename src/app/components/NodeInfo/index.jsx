import React, { useEffect, useState } from "react";
import { Form, Input } from "antd";

const FormItem = Form.Item;

const layout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 20,
  },
};

const NodeInfo = ({ initialValues = {} }) => {
  const [form] = Form.useForm();
  const [color, setColor] = useState("");
  useEffect(() => {
    const values = initialValues.data ? initialValues.data : initialValues;
    if (values) {
      form.setFieldsValue({
        id: values.id || values.identity_pubkey,
        alias: values.alias,
        color: values.color,
        version: values.version,
        network:
          values.network || (values.testnet === false ? "mainet" : "testnet"),
        blockHeight: values.block_height || values.blockheight,
        numPeers: values.num_peers,
        numActiveChannels: values.num_active_channels,
        numPendingChannels: values.num_pending_channels,
        numInactiveChannels: values.num_inactive_channels,
      });
      const hexColor =
        values.color && values.color[0] === "#"
          ? values.color
          : `#${values.color || ""}`;
      setColor(hexColor);
    }
  }, [form, initialValues]);

  return (
    <Form {...layout} form={form} name="basic" layout="horizontal">
      <FormItem label="ID" name="id">
        <Input disabled />
      </FormItem>
      <FormItem label="Alias" name="alias">
        <Input disabled />
      </FormItem>
      <FormItem label="Color" name="color">
        <Input disabled style={{ backgroundColor: color }} />
      </FormItem>
      <FormItem label="Version" name="version">
        <Input disabled />
      </FormItem>
      <FormItem label="Network" name="network">
        <Input disabled />
      </FormItem>
      <FormItem label="Block Height" name="blockHeight">
        <Input disabled />
      </FormItem>
      <FormItem label="Peers" name="numPeers">
        <Input disabled />
      </FormItem>
      <FormItem label="Active Channels" name="numActiveChannels">
        <Input disabled />
      </FormItem>
      <FormItem label="Pending Channels" name="numPendingChannels">
        <Input disabled />
      </FormItem>
      <FormItem label="Inactive Channels" name="numInactiveChannels">
        <Input disabled />
      </FormItem>
    </Form>
  );
};

export default NodeInfo;
