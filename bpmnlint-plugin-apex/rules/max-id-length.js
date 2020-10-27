
  /**
   * A rule that checks the length of a node's ID.
   */
  module.exports = function() {
  
    function check(node, reporter) {

        const id = node.id;

        if (id && id.length > 50) {
          reporter.report(node.id, 'Element ID is longer than 50 characters');
        }
    }
  
    return { check };
  };
  
