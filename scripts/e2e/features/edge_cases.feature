Feature: Edge Cases

  As a system, I want to handle invalid inputs and empty states gracefully.

  Scenario: Attempting to create a semester with invalid dates
    Given I am creating a new semester
    When I enter an end date that is before the start date
    Then the "Save Semester" button should be disabled

  Scenario: Navigation to an empty semester
    Given a semester with no assigned seminars "Empty Semester"
    When I view the portal for "Empty Semester"
    Then I should see a "No seminars scheduled for this semester" message.
