import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RadicaTagModule = buildModule("RadicaTagModule", (m) => {
  const radicaTag = m.contract("RadicaTag");
  const radicaProperty = m.contract("RadicaProperty", [radicaTag], {
    after: [radicaTag],
  });

  return { radicaTag, radicaProperty };
});

export default RadicaTagModule;
