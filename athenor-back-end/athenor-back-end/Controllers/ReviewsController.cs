using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using athenor_back_end.Data;
using athenor_back_end.Models;

namespace athenor_back_end.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReviewsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Reviews/tutors - Get all users available for review (public - no stars shown) - excludes admin
        [HttpGet("tutors")]
        public async Task<IActionResult> GetTutors()
        {
            var tutors = await _context.Users
                .Where(u => !u.OptOutReviews && u.Email != "***REMOVED***" && u.IsEmailVerified)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.ProfilePicture
                })
                .ToListAsync();

            return Ok(tutors);
        }

        // GET: api/Reviews/all-users - Get all users with review stats (admin only) - excludes ***REMOVED***
        [HttpGet("all-users")]
        public async Task<IActionResult> GetAllUsersWithReviews()
        {
            var users = await _context.Users
                .Where(u => u.Email != "***REMOVED***")
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.ProfilePicture,
                    AverageRating = _context.Reviews
                        .Where(r => r.TutorId == u.Id)
                        .Average(r => (double?)r.Rating) ?? 0,
                    ReviewCount = _context.Reviews.Count(r => r.TutorId == u.Id)
                })
                .ToListAsync();

            return Ok(users);
        }

        // GET: api/Reviews/tutor/{tutorId} - Get reviews for a specific user
        [HttpGet("tutor/{tutorId}")]
        public async Task<IActionResult> GetTutorReviews(int tutorId)
        {
            var tutor = await _context.Users.FindAsync(tutorId);
            if (tutor == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var reviews = await _context.Reviews
                .Where(r => r.TutorId == tutorId)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    r.Id,
                    r.Rating,
                    r.Comment,
                    r.ReviewerName,
                    r.CreatedAt
                })
                .ToListAsync();

            var tutorInfo = new
            {
                tutor.Id,
                tutor.FullName,
                tutor.ProfilePicture,
                AverageRating = reviews.Any() ? reviews.Average(r => r.Rating) : 0,
                ReviewCount = reviews.Count,
                Reviews = reviews
            };

            return Ok(tutorInfo);
        }

        // POST: api/Reviews - Submit a new review
        [HttpPost]
        public async Task<IActionResult> SubmitReview([FromBody] ReviewDto reviewDto)
        {
            if (reviewDto.Rating < 1 || reviewDto.Rating > 5)
            {
                return BadRequest(new { message = "Rating must be between 1 and 5" });
            }

            if (string.IsNullOrWhiteSpace(reviewDto.ReviewerName))
            {
                return BadRequest(new { message = "Reviewer name is required" });
            }

            var tutor = await _context.Users.FindAsync(reviewDto.TutorId);
            if (tutor == null)
            {
                return NotFound(new { message = "User not found" });
            }

            if (tutor.OptOutReviews)
            {
                return BadRequest(new { message = "This user has opted out of reviews" });
            }

            var review = new Review
            {
                TutorId = reviewDto.TutorId,
                Rating = reviewDto.Rating,
                Comment = reviewDto.Comment ?? "",
                ReviewerName = reviewDto.ReviewerName,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Review submitted successfully", reviewId = review.Id });
        }

        // DELETE: api/Reviews/{id} - Delete a review (admin only, for future use)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null)
            {
                return NotFound(new { message = "Review not found" });
            }

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Review deleted successfully" });
        }
    }

    public class ReviewDto
    {
        public int TutorId { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public string ReviewerName { get; set; } = string.Empty;
    }
}
