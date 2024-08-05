import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RadixTagModule = buildModule("RadixTagModule", (m) => {
  const radixTag = m.contract("RadixTag");
  return { radixTag };
});

export default RadixTagModule;
