Feature: UX Feedback

  As a user, I want to see clear loading states and feedback so I know the system is processing my requests.

  Scenario: Global loader is visible during navigation
    When I navigate to the Semester Management page
    Then the global loader should appear and disappear

  Scenario: Success toast is visible after action
    Given I am logged in as an administrator
    And I am on the Admin Dashboard
    When I create a new semester named "Temp Semester"
    Then a success toast should be visible
