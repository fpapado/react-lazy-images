# Always

- Docs improvements! See [`FEEDBACK.md`](./FEEDBACK.md) for specific points.
- Loading patterns and auxiliary component examples

# v1

- [x] Upgrade devDeps
- [x] Upgrade microbundle
- [ ] Check --external all consequence
- [ ] Upgrade react-intersection-observer
- [ ] Split out renderXYZ components
- [ ] Refactor props
- [ ] Props getter
- [x] Elicit feedback and use cases for the public API
- [ ] Investigate container `<div>`
- [ ] Solidify `<noscript>` fallback
- [ ] experimentalDecoding

# Investigate

- [ ] Auto sizes (if not handled already by browser behaviour)
- [ ] cancel loading on componentWillUnmount

# Later

- [ ] abort loading if image leaves viewport and it has not loaded sufficiently
  - Likely a large change to how we do things
  - Possibly with using fetch and cancelling it
  - Probably a mess
