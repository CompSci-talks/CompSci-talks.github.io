Feature: Comments & Moderation

  As a user, I want to comment on seminars to engage in discussion.
  As an administrator, I want to moderate comments to maintain a professional environment.

  Scenario: User posts a comment and a reply
    Given I am logged in as a standard user
    And I am on a seminar detail page for "Quantum Computing 101"
    When I post a comment "This is a great seminar topic!"
    Then the global loader should appear and disappear
    And a success toast should be visible
    And the comment "This is a great seminar topic!" should be visible
    When I reply to the comment "This is a great seminar topic!" with "I agree!"
    Then the reply "I agree!" should be visible nested under the original comment

  Scenario: Admin moderates a comment
    Given I am logged in as a standard user
    And I am on a seminar detail page for "Quantum Computing 101"
    And I post a comment "This is a offensive comment"
    When I log in as an administrator
    And I navigate to the moderation view for "Quantum Computing 101"
    And I delete the comment "This is a offensive comment"
    Then the comment "This is a offensive comment" should no longer be visible for any user
