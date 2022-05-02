/**
 * A rule that warns when using collapsed sub processes.
 */
module.exports = function () {
  function check(businessObject, reporter) {
    if (
      businessObject.$type === 'bpmn:SubProcess' &&
      !businessObject.di.isExpanded
    ) {
      reporter.report(
        businessObject.id,
        'Collapsed sub processes should not be used. Use an expanded sub process or call activity instead.'
      );
    }
  }

  return { check };
};
