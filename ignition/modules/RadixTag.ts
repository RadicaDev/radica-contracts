import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RadixTagModule = buildModule("RadixTag", (m) => {
  const radixTag = m.contract("RadixTag");
  const radixProperty = m.contract("RadixProperty", [radixTag], {
    after: [radixTag],
  });

  return { radixTag, radixProperty };
});

export default RadixTagModule;
