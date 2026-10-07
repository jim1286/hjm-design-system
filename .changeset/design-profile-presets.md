---
"@hjmds/design-contracts": minor
"@hjmds/react": minor
"@hjmds/react-native": minor
---

Add ten experimental reference design profiles with validated light/dark palettes, appearance tokens, interaction defaults and composition/screen choices. Products define partial overrides once and pass the normalized profile to their Web or Native provider; explicit component props and brand overrides retain precedence. Add optional OverviewScreen using existing screen/state/grid/disclosure engines, plus persistent inline/collapsible tools. Existing consumers without a profile keep their defaults. Real glass backdrop blur and clay inset shadows remain unsupported; see the design-profile contract and research/QA report for coverage.
