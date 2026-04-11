Feature: Semester Management

  As an administrator, I want to manage the lifecycle of semesters so that I can organize academic sessions.

  Background:
    Given I am logged in as an administrator
    And I am on the Admin Dashboard

  Scenario: Admin creates and activates a new semester
    When I navigate to the Semester Management page
    And I fill in the semester name as "Spring 2027"
    And I click "Create Semester"
    Then I should see "Spring 2027" in the semester list
    When I click "Set Active" for "Spring 2027"
    Then "Spring 2027" should have the active status indicator
