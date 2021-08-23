module.exports = {
  configs: {
    recommended: {
      rules: {
        'apex/max-id-length': 'error',
        'apex/merge-split-gateways': 'warn'
      }
    },
    all: {
      rules: {
        'apex/id-was-changed': 'warn',
        'apex/max-id-length': 'error',
        'apex/merge-split-gateways': 'warn'
      }
    }
  }
};