import { algorandFixture } from "@algorandfoundation/algokit-utils/testing";
import { WaypointRegistryFactory } from "../artifacts/waypoint_registry/waypoint-registryClient";
import algosdk, { Account } from "algosdk";

export interface LinearDeployParams {
  deployer: Account;
  tokenId: bigint;
  fluxOracleAppId: bigint;
  treasury: Account;
  feeBps: bigint;
}

export const deploy = async ({ deployer, tokenId, fluxOracleAppId, treasury, feeBps }: LinearDeployParams) => {
  const localnet = algorandFixture();
  await localnet.newScope(); // Ensure context is initialized before accessing it
  localnet.algorand.setSignerFromAccount(deployer);

  const factory = localnet.algorand.client.getTypedAppFactory(WaypointRegistryFactory, {
    defaultSender: deployer.addr,
  });

  const { appClient } = await factory.send.create.createApplication({
    args: {
      admin: deployer.addr.toString(),
      feeBps,
      treasury: treasury.addr.toString(),
      nominatedAssetId: tokenId,
      fluxOracleApp: fluxOracleAppId,
    },
    sender: deployer.addr,
    accountReferences: [deployer.addr],
    assetReferences: [tokenId],
  });
  appClient.algorand.setSignerFromAccount(deployer);
  console.log("Registry app Created, address", algosdk.encodeAddress(appClient.appAddress.publicKey));
  return appClient;
};
