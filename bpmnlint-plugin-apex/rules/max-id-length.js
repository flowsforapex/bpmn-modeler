/**
 * A rule that checks the length of a businessObjects's ID.
 */
module.exports = function () {
  function check(businessObject, reporter) {
    const { id } = businessObject;
    const isIdTooLong = id && id.length > 50;

    if (isIdTooLong) {
      reporter.report(businessObject.id, 'Element ID is longer than 50 characters');
    }
  }

  return { check };
};
