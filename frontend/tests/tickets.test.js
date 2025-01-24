const {
  createTicket,
  getTicketById,
  updateTicket,
  deleteTicket
} = require('../src/database');

describe("Tickets Table Tests", () => {
  let createdTicketId;

  it("should create a ticket with valid data", async () => {
    const ticketData = {
      title: "Test Ticket",
      description: "This is a test ticket",
      status: "new",
      priority: "medium",
      created_by: "e5c6cf84-9c3d-4b63-8a7c-32d7c2941e12",
      metadata: { source: "unit_test" }
    };

    const ticket = await createTicket(ticketData);
    createdTicketId = ticket.id;
    expect(ticket).toHaveProperty('id');
    expect(ticket.title).toBe(ticketData.title);
    expect(ticket.status).toBe(ticketData.status);
    expect(ticket.metadata).toHaveProperty('source');
  });

  it("should retrieve a ticket by ID", async () => {
    const ticket = await getTicketById(createdTicketId);
    expect(ticket.id).toBe(createdTicketId);
  });

  it("should update a ticket", async () => {
    const updates = {
      status: "in_progress",
      priority: "high",
      assigned_to: "8f9c55da-5c13-4f28-9e4e-74a8c1834875"
    };
    const ticket = await updateTicket(createdTicketId, updates);
    expect(ticket.status).toBe(updates.status);
    expect(ticket.priority).toBe(updates.priority);
    expect(ticket.assigned_to).toBe(updates.assigned_to);
  });

  it("should delete a ticket", async () => {
    const result = await deleteTicket(createdTicketId);
    expect(result).toBe(true);
  });
});
