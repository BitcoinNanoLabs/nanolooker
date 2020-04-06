import React from "react";
import { Button, Tooltip, Typography } from "antd";
import {
  WalletOutlined,
  CheckOutlined,
  CopyOutlined,
  QrcodeOutlined
} from "@ant-design/icons";
import find from "lodash/find";
import { useParams } from "react-router-dom";
import CopyToClipboard from "react-copy-to-clipboard";
import QRCodeModal from "components/QRCodeModal";
import { RepresentativesContext } from "api/contexts/Representatives";
import { ConfirmationQuorumContext } from "api/contexts/ConfirmationQuorum";
import { KnownAccountsContext, KnownAccount } from "api/contexts/KnownAccounts";
import { Colors } from "components/utils";

const { Title } = Typography;
let copiedTimeout: number | undefined;

const AccountHeader = () => {
  const { account = "" } = useParams();
  const [isCopied, setIsCopied] = React.useState<boolean>(false);
  const [knownAccount, setKnownAccount] = React.useState<KnownAccount>();
  const [representativeAccount, setRepresentativeAccount] = React.useState(
    {} as any
  );
  const {
    representatives,
    isLoading: isRepresentativesLoading
  } = React.useContext(RepresentativesContext);
  const {
    confirmationQuorum: { principal_representative_min_weight: minWeight }
  } = React.useContext(ConfirmationQuorumContext);
  const { knownAccounts } = React.useContext(KnownAccountsContext);

  React.useEffect(() => {
    if (!account || isRepresentativesLoading || !representatives.length) return;

    setRepresentativeAccount(find(representatives, ["account", account]) || {});

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, isRepresentativesLoading, representatives.length]);

  React.useEffect(() => {
    if (!account || !knownAccounts.length) return;

    setKnownAccount(
      knownAccounts.find(
        ({ account: knownAccount }) => knownAccount === account
      )
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, knownAccounts.length]);

  return (
    <>
      {representativeAccount?.account && minWeight ? (
        <>
          <Title level={3}>
            {representativeAccount.weight >= minWeight ? "Principal " : ""}
            Representative
          </Title>
        </>
      ) : null}
      {knownAccount ? (
        <Title level={4} style={{ marginTop: 0 }}>
          {knownAccount.alias}
        </Title>
      ) : null}
      <p
        style={{
          fontSize: "16px",
          marginRight: "6px",
          wordWrap: "break-word",
          position: "relative"
        }}
        className="color-normal clearfix"
      >
        <WalletOutlined
          style={{
            fontSize: "18px",
            marginTop: "4px",
            marginRight: "6px",
            float: "left"
          }}
        />
        <span style={{ marginRight: "6px" }}>
          <span>
            {account.substr(account.length * -1, account.length - 60)}
          </span>
          <span style={{ color: "#1890ff" }}>{account.substr(-60, 7)}</span>
          <span>{account.substr(-53, 46)}</span>
          <span style={{ color: "#1890ff" }}>{account.substr(-7)}</span>
        </span>
        <Tooltip
          title={isCopied ? "Copied!" : "Copy"}
          overlayClassName="tooltip-sm"
        >
          <CopyToClipboard
            text={account}
            onCopy={() => {
              setIsCopied(true);
              clearTimeout(copiedTimeout);
              copiedTimeout = window.setTimeout(() => {
                setIsCopied(false);
              }, 2000);
            }}
          >
            <Button
              shape="circle"
              size="small"
              disabled={isCopied}
              style={{
                marginRight: "6px",
                borderColor: isCopied ? (Colors.RECEIVE as string) : undefined
              }}
            >
              {isCopied ? (
                <CheckOutlined style={{ color: Colors.RECEIVE as string }} />
              ) : (
                <CopyOutlined />
              )}
            </Button>
          </CopyToClipboard>
        </Tooltip>
        {/* <Tooltip title="QR code" overlayClassName="tooltip-sm"> */}
        <QRCodeModal text={account}>
          <Button
            shape="circle"
            icon={<QrcodeOutlined />}
            size="small"
            style={{ marginRight: "6px" }}
          />
        </QRCodeModal>
        {/* </Tooltip> */}
      </p>
    </>
  );
};

export default AccountHeader;
