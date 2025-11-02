import { algorandFixture } from "@algorandfoundation/algokit-utils/testing";
import { WaypointInvoiceFactory } from "../artifacts/waypoint_invoice/waypoint-invoiceClient";
import algosdk, { Account } from "algosdk";

export interface InvoiceDeployParams {
  deployer: Account;
  tokenId: bigint;
  fluxOracleAppId: bigint;
  treasury: Account;
  feeBps: bigint;
  registryAppId: bigint;
}

export const deploy = async ({ deployer, tokenId, fluxOracleAppId, treasury, feeBps, registryAppId }: InvoiceDeployParams) => {
  const localnet = algorandFixture();
  await localnet.newScope(); // Ensure context is initialized before accessing it
  localnet.algorand.setSignerFromAccount(deployer);

  const factory = localnet.algorand.client.getTypedAppFactory(WaypointInvoiceFactory, {
    defaultSender: deployer.addr,
  });
  const { appClient } = await factory.send.create.createApplication({
    args: {
      registryAppId,
      tokenId,
    },
    sender: deployer.addr,
    accountReferences: [deployer.addr],
    assetReferences: [tokenId],
  });
  appClient.algorand.setSignerFromAccount(deployer);
  console.log("Invoice App Created, address", algosdk.encodeAddress(appClient.appAddress.publicKey));
  return appClient;
};
