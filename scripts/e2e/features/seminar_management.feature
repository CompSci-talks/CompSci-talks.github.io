Feature: Seminar Management

  As an administrator, I want to add and update seminars to keep the schedule current.

  Background:
    Given I am logged in as an administrator
    And I have an active semester "Spring 2027"

  Scenario: Admin adds a seminar with speakers and tags
    When I navigate to the Seminar Management page
    And I open the "Add Seminar" form
    And I fill in the following seminar details:
      | title     | Quantum Computing 101 |
      | abstract  | Intro to QC basics    |
      | location  | Hall A                |
    And I select speaker "Alice Smith"
    And I add tag "Physics"
    And I click "Save Seminar"
    Then I should see "Quantum Computing 101" in the seminar list
    And I should see it in the public portal for "Spring 2027"

  Scenario: Admin updates an existing seminar
    Given there is an existing seminar "Quantum Computing 101"
    When I edit the seminar "Quantum Computing 101"
    And I change the location to "Virtual"
    And I save the changes
    Then the seminar "Quantum Computing 101" location should be "Virtual"
