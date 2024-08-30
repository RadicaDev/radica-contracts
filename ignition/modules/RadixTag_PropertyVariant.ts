import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RadixTagProperyVariantModule = buildModule(
  "RadixTagPropertyVariantModule",
  (m) => {
    const radixTag = m.contract("RadixTag_PropertyVariant");
    const radixProperty = m.contract("RadixProperty", [radixTag], {
      after: [radixTag],
    });

    return { radixTag, radixProperty };
  },
);

export default RadixTagProperyVariantModule;
